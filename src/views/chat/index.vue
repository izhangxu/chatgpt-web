<script setup lang='ts'>
import type { Ref } from 'vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { NAutoComplete, NButton, NIcon, NInput, NUpload, NUploadFileList, NUploadTrigger, useDialog, useMessage } from 'naive-ui'
import type { UploadFileInfo } from 'naive-ui'
import { CloudUploadOutline } from '@vicons/ionicons5'
import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useChat } from './hooks/useChat'
import { SvgIcon } from '@/components/common'
import { useChatStore, useUserStore } from '@/store'
import { fetchChatAPIProcess } from '@/api'
import { t } from '@/locales'

const message = useMessage()
const route = useRoute()
const dialog = useDialog()

const chatStore = useChatStore()
const userStore = useUserStore()

const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex } = useChat()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll()
const { uuid }: any = route.params as { uuid: string }

const dataSources = computed(() => chatStore.getChatByUuid(uuid))
const sysText = ref<string>('')
const prompt = ref<string>('')
const imageUrl = ref<string>('')
const loading = ref<boolean>(false)
const inputRef = ref<Ref | null>(null)
const lastText = ref<string>('')
const sse = ref<any>()

const fileList = ref<UploadFileInfo[]>([])

// 使用storeToRefs，保证store修改后，联想部分能够重新渲染

// 未知原因刷新页面，loading 状态不会重置，手动重置
dataSources.value.forEach((item: any, index: number) => {
  if (item.loading)
    updateChatSome(uuid, index, { loading: false })
})

function handleSubmit() {
  onConversation()
}

class RetriableError extends Error { }
class FatalError extends Error { }

async function initSSE() {
  const controller = new AbortController()

  await fetchEventSource('http://111.61.30.152:80/chat/stream', {
    method: 'GET',
    signal: controller.signal,
    async onopen(response) {
      if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
      // everything's good
      }
      else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
      // client-side errors are usually non-retriable:
        throw new FatalError()
      }
      else {
        throw new RetriableError()
      }
    },
    onmessage(msg) {
    // if the server emits an error message, throw an exception
    // so it gets handled by the onerror callback below:
      if (msg.event === 'FatalError')
        throw new FatalError(msg.data)

      const { data } = msg
      const { response } = JSON.parse(data)
      lastText.value = response

      if (response !== 'done') {
        updateChat(
          uuid,
          dataSources.value.length - 1,
          {
            dateTime: new Date().toLocaleString(),
            text: lastText.value,
            error: false,
            inversion: false,
            loading: true,
          },
        )
      }
      else {
        updateChatSome(
          uuid,
          dataSources.value.length - 1,
          {
            error: false,
            loading: false,
          },
        )
        controller.abort()
      }
    },
    onclose() {
    // if the server closes the connection unexpectedly, retry:
      throw new RetriableError()
    },
    onerror(err) {
      if (err instanceof FatalError)
        throw err // rethrow to stop the operation

      else
        return 3000
      // do nothing to automatically retry. You can also
      // return a specific retry interval here.
    },
  })

  return controller
}

async function onConversation() {
  const message = prompt.value
  const image_url = imageUrl.value
  const system = sysText.value

  if (loading.value)
    return

  if (!message || message.trim() === '')
    return

  // 图片参数
  if (image_url) {
    addChat(
      uuid,
      {
        dateTime: new Date().toLocaleString(),
        inversion: true,
        text: image_url,
        error: false,
      },
    )
  }
  // 文字参数
  addChat(
    uuid,
    {
      dateTime: new Date().toLocaleString(),
      inversion: true,
      text: message,
      error: false,
    },
  )

  loading.value = true
  prompt.value = ''
  imageUrl.value = ''
  sysText.value = ''
  fileList.value = []

  try {
    lastText.value = ''
    const user_id = userStore.userInfo.name

    await fetchChatAPIProcess<any>({
      user_id,
      uuid,
      message: {
        text: message,
        image_url,
        system,
      },
    })
      .then((res: any) => {
        if (res.status === 'success') {
          // 思考中
          addChat(
            uuid,
            {
              dateTime: new Date().toLocaleString(),
              text: t('chat.thinking'),
              inversion: false,
              loading: true,
              error: false,
            },
          )
          // 建立连接，改为动态建立
          sse.value = initSSE()

          scrollToBottom()
        }
      })

    updateChatSome(uuid, dataSources.value.length - 1, { loading: false })
  }
  catch (error: any) {
    const errorMessage = error?.message ?? t('common.wrong')

    // if (error.message === 'canceled') {
    //   updateChatSome(
    //     uuid,
    //     dataSources.value.length - 1,
    //     {
    //       loading: false,
    //     },
    //   )
    //   scrollToBottomIfAtBottom()
    //   return
    // }

    const currentChat = getChatByUuidAndIndex(uuid, dataSources.value.length - 1)

    if (currentChat?.text && currentChat.text !== '') {
      updateChatSome(
        uuid,
        dataSources.value.length - 1,
        {
          text: `${currentChat.text}\n[${errorMessage}]`,
          error: false,
          loading: false,
        },
      )
      return
    }

    updateChat(
      uuid,
      dataSources.value.length - 1,
      {
        dateTime: new Date().toLocaleString(),
        text: errorMessage,
        error: true,
        inversion: false,
        loading: false,
      },
    )
    scrollToBottomIfAtBottom()
  }
  finally {
    loading.value = false
  }
}

function handleDelete(index: number) {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.deleteMessage'),
    content: t('chat.deleteMessageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.deleteChatByUuid(uuid, index)
    },
  })
}

function handleEnter(event: KeyboardEvent) {
  if (event.key === 'Enter' && event.ctrlKey) {
    event.preventDefault()
    handleSubmit()
  }
}

const placeholder = computed(() => {
  return t('chat.placeholder')
})

const buttonDisabled = computed(() => {
  return loading.value || !prompt.value || prompt.value.trim() === ''
})

const fileListClass = computed(() => {
  let classes = 'w-48 z-40'
  if (fileList.value?.length)
    classes += ' show-in-input'

  return classes
})

const beforeUpload = async (data: {
  file: UploadFileInfo
  fileList: UploadFileInfo[]
}) => {
  if (data.file.file?.type && !['image/gif', 'image/jpeg', 'image/jpg', 'image/png', 'image/svg'].includes(data.file.file?.type)) {
    message.error('只能上传图片文件，请重新上传')
    return false
  }
  return true
}

const handleUploadChange = (data: { fileList: UploadFileInfo[]; event: any }) => {
  fileList.value = data.fileList

  if (data.fileList.length) {
    try {
      const { responseText } = data.event.target
      const res = JSON.parse(responseText)
      const { image_url }: any = res

      imageUrl.value = image_url
    }
    catch (e) {
    // console.log(e)
    }
  }
  else {
    imageUrl.value = ''
  }
}

async function init() {
  await chatStore.getChatList({ uuid, user_id: userStore.userInfo.name })

  scrollToBottom()
  if (inputRef.value)
    inputRef.value?.focus()
}

onBeforeRouteUpdate(() => {
  init()
})

onMounted(async () => {
  await init()
})

onUnmounted(() => {
  sse.value?.abort?.()
})
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <main class="flex-1 overflow-hidden">
      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto">
        <div
          class="w-full max-w-screen-xl m-auto dark:bg-[#101014] p-4"
        >
          <div id="image-wrapper" class="relative">
            <template v-if="!dataSources.length">
              <div class="flex items-center justify-center mt-4 text-center text-neutral-300">
                <SvgIcon icon="ri:bubble-chart-fill" class="mr-2 text-3xl" />
                <span>{{ t('chat.newChatTitle') }}</span>
              </div>
            </template>
            <template v-else>
              <div>
                <Message
                  v-for="(item, index) of dataSources"
                  :key="index"
                  :text="item.text"
                  :inversion="item.inversion"
                  :error="item.error"
                  :loading="item.loading"
                  @delete="handleDelete(index)"
                />
                <div class="sticky bottom-0 left-0 flex justify-center">
                  <!-- loading效果 -->
                  <NButton v-if="loading" type="warning">
                    <template #icon>
                      <SvgIcon icon="ri:stop-circle-line" />
                    </template>
                    {{ t('common.stopResponding') }}
                  </NButton>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </main>
    <footer class="p-4">
      <div class="w-full max-w-screen-xl m-auto pl-4 pr-4">
        <div class="flex items-center justify-between mb-4 w-1/2" style="padding-left: 58px;">
          <NInput v-model:value="sysText" class="bg-white" type="text" placeholder="system提示文本输入" />
        </div>
        <div class="flex items-center justify-between space-x-2">
          <!-- 输入框 -->
          <NUpload
            v-model:file-list="fileList"
            abstract
            list-type="image"
            action="http://111.61.30.152:80/chat/images"
            :max="1"
            @before-upload="beforeUpload"
            @change="handleUploadChange"
          >
            <div class="pr-4">
              <NUploadTrigger #="{ handleClick }" abstract>
                <NButton circle @click="handleClick">
                  <NIcon size="18">
                    <CloudUploadOutline />
                  </NIcon>
                </NButton>
              </NUploadTrigger>
            </div>
            <div class="flex flex-col w-full custom-wrapper">
              <NUploadFileList :class="fileListClass" />
              <NAutoComplete v-model:value="prompt">
                <template #default="{ handleInput, handleBlur, handleFocus }">
                  <NInput
                    ref="inputRef"
                    v-model:value="prompt"
                    type="textarea"
                    :theme-overrides="{ border: '0' }"
                    :placeholder="placeholder"
                    :autosize="{ minRows: 1, maxRows: 8 }"
                    @input="handleInput"
                    @focus="handleFocus"
                    @blur="handleBlur"
                    @keypress="handleEnter"
                  />
                </template>
              </NAutoComplete>
            </div>
          </NUpload>
          <!-- 按钮 -->
          <NButton type="primary" :disabled="buttonDisabled" @click="handleSubmit">
            发送
            <template #icon>
              <span class="dark:text-black">
                <SvgIcon icon="ri:send-plane-fill" />
              </span>
            </template>
          </NButton>
        </div>
      </div>
    </footer>
  </div>
</template>

<style lang="less" scoped>
.custom-wrapper {
  box-shadow:  0 2px 16px 0 rgba(0,0,0,0.1), 0 0 16px -2px rgba(0,0,0,0.06);
  border: 1px solid rgb(224, 224, 230);
  border-radius: 3px;

  .n-upload-file-list.show-in-input {
    margin: 12px;
    background-color: rgb(243, 243, 245);
  }

  &:hover {
    border: 1px solid #36ad6a;
  }

  ::v-deep(.n-input) {
    --n-border: none !important;
    --n-border-hover: none !important;
    --n-border-focus: none !important;
    --n-box-shadow-focus: none !important;
    --n-border-radius: none !important;
  }

}
</style>
