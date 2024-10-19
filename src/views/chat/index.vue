<script setup lang='ts'>
import type { Ref } from 'vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { NAutoComplete, NButton, NIcon, NInput, NUpload, NUploadFileList, NUploadTrigger, useDialog, useMessage } from 'naive-ui'
import type { UploadFileInfo } from 'naive-ui'
import { CloudUploadOutline } from '@vicons/ionicons5'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useChat } from './hooks/useChat'
import { SvgIcon } from '@/components/common'
import { useChatStore } from '@/store'
import { fetchChatAPIProcess } from '@/api'
import { t } from '@/locales'

let controller = new AbortController()

const openLongReply = import.meta.env.VITE_GLOB_OPEN_LONG_REPLY === 'true'

const message = useMessage()
const route = useRoute()
const dialog = useDialog()

const chatStore = useChatStore()
// const userStore = useUserStore()
const { addChat, updateChat, updateChatSome, getChat } = useChat()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll()

const { uuid } = route.params as { uuid: string }

const dataSources = computed(() => chatStore.getChatList(+uuid))

const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !!item.conversationOptions)))

const sysValue = ref<string>('')
const prompt = ref<string>('')
const loading = ref<boolean>(false)
const inputRef = ref<Ref | null>(null)

const fileList = ref<UploadFileInfo[]>([
  {
    id: 'c',
    name: '图片.png',
    status: 'finished',
    url: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg',
  },
])

// 使用storeToRefs，保证store修改后，联想部分能够重新渲染

// 未知原因刷新页面，loading 状态不会重置，手动重置
dataSources.value.forEach((item, index) => {
  if (item.loading)
    updateChatSome(+uuid, index, { loading: false })
})

function handleSubmit() {
  onConversation()
}

async function onConversation() {
  let message = prompt.value

  if (loading.value)
    return

  if (!message || message.trim() === '')
    return

  controller = new AbortController()

  addChat(
    +uuid,
    {
      dateTime: new Date().toLocaleString(),
      text: message,
      inversion: true,
      error: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: null },
    },
  )
  scrollToBottom()

  loading.value = true
  prompt.value = ''

  let options: Chat.ConversationRequest = {}
  const lastContext = conversationList.value[conversationList.value.length - 1]?.conversationOptions

  if (lastContext)
    options = { ...lastContext }

  addChat(
    +uuid,
    {
      dateTime: new Date().toLocaleString(),
      text: t('chat.thinking'),
      loading: true,
      inversion: false,
      error: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    },
  )
  scrollToBottom()

  try {
    let lastText = ''
    const fetchChatAPIOnce = async () => {
      await fetchChatAPIProcess<Chat.ConversationResponse>({
        prompt: message,
        options,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          const xhr = event.target
          const { responseText } = xhr
          // Always process the final line
          const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
          let chunk = responseText
          if (lastIndex !== -1)
            chunk = responseText.substring(lastIndex)
          try {
            const { data } = JSON.parse(chunk)
            updateChat(
              +uuid,
              dataSources.value.length - 1,
              {
                dateTime: new Date().toLocaleString(),
                text: lastText + (data.text ?? ''),
                inversion: false,
                error: false,
                loading: true,
                conversationOptions: { conversationId: data.conversationId, parentMessageId: data.id },
                requestOptions: { prompt: message, options: { ...options } },
              },
            )

            if (openLongReply && data.detail.choices[0].finish_reason === 'length') {
              options.parentMessageId = data.id
              lastText = data.text
              message = ''
              return fetchChatAPIOnce()
            }

            scrollToBottomIfAtBottom()
          }
          catch (error) {
            //
          }
        },
      })
      updateChatSome(+uuid, dataSources.value.length - 1, { loading: false })
    }

    await fetchChatAPIOnce()
  }
  catch (error: any) {
    const errorMessage = error?.message ?? t('common.wrong')

    if (error.message === 'canceled') {
      updateChatSome(
        +uuid,
        dataSources.value.length - 1,
        {
          loading: false,
        },
      )
      scrollToBottomIfAtBottom()
      return
    }

    const currentChat = getChat(+uuid, dataSources.value.length - 1)

    if (currentChat?.text && currentChat.text !== '') {
      updateChatSome(
        +uuid,
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
      +uuid,
      dataSources.value.length - 1,
      {
        dateTime: new Date().toLocaleString(),
        text: errorMessage,
        inversion: false,
        error: true,
        loading: false,
        conversationOptions: null,
        requestOptions: { prompt: message, options: { ...options } },
      },
    )
    scrollToBottomIfAtBottom()
  }
  finally {
    loading.value = false
  }
}

async function onRegenerate(index: number) {
  if (loading.value)
    return

  controller = new AbortController()

  const { requestOptions } = dataSources.value[index]

  let message = requestOptions?.prompt ?? ''

  let options: Chat.ConversationRequest = {}

  if (requestOptions.options)
    options = { ...requestOptions.options }

  loading.value = true

  updateChat(
    +uuid,
    index,
    {
      dateTime: new Date().toLocaleString(),
      text: '',
      inversion: false,
      error: false,
      loading: true,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    },
  )

  try {
    let lastText = ''
    const fetchChatAPIOnce = async () => {
      await fetchChatAPIProcess<Chat.ConversationResponse>({
        prompt: message,
        options,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          const xhr = event.target
          const { responseText } = xhr
          // Always process the final line
          const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
          let chunk = responseText
          if (lastIndex !== -1)
            chunk = responseText.substring(lastIndex)
          try {
            const data = JSON.parse(chunk)
            updateChat(
              +uuid,
              index,
              {
                dateTime: new Date().toLocaleString(),
                text: lastText + (data.text ?? ''),
                inversion: false,
                error: false,
                loading: true,
                conversationOptions: { conversationId: data.conversationId, parentMessageId: data.id },
                requestOptions: { prompt: message, options: { ...options } },
              },
            )

            if (openLongReply && data.detail.choices[0].finish_reason === 'length') {
              options.parentMessageId = data.id
              lastText = data.text
              message = ''
              return fetchChatAPIOnce()
            }
          }
          catch (error) {
            //
          }
        },
      })
      updateChatSome(+uuid, index, { loading: false })
    }
    await fetchChatAPIOnce()
  }
  catch (error: any) {
    if (error.message === 'canceled') {
      updateChatSome(
        +uuid,
        index,
        {
          loading: false,
        },
      )
      return
    }

    const errorMessage = error?.message ?? t('common.wrong')

    updateChat(
      +uuid,
      index,
      {
        dateTime: new Date().toLocaleString(),
        text: errorMessage,
        inversion: false,
        error: true,
        loading: false,
        conversationOptions: null,
        requestOptions: { prompt: message, options: { ...options } },
      },
    )
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
      chatStore.deleteChatByUuid(+uuid, index)
    },
  })
}

function handleEnter(event: KeyboardEvent) {
  if (event.key === 'Enter' && event.ctrlKey) {
    event.preventDefault()
    handleSubmit()
  }
}

function handleStop() {
  if (loading.value) {
    controller.abort()
    loading.value = false
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

const handleUploadChange = (data: { fileList: UploadFileInfo[] }) => {
  fileList.value = data.fileList
}
onMounted(() => {
  scrollToBottom()

  if (inputRef.value)
    inputRef.value?.focus()
})

onUnmounted(() => {
  if (loading.value)
    controller.abort()
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
                  :date-time="item.dateTime"
                  :text="item.text"
                  :inversion="item.inversion"
                  :error="item.error"
                  :loading="item.loading"
                  @regenerate="onRegenerate(index)"
                  @delete="handleDelete(index)"
                />
                <div class="sticky bottom-0 left-0 flex justify-center">
                  <NButton v-if="loading" type="warning" @click="handleStop">
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
          <NInput v-model:value="sysValue" class="bg-white" type="text" placeholder="system提示文本输入" />
        </div>
        <div class="flex items-center justify-between space-x-2">
          <!-- 输入框 -->
          <NUpload
            v-model:file-list="fileList"
            abstract
            list-type="image"
            action="https://www.mocky.io/v2/5e4bafc63100007100d8b70f"
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
