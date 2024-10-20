<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { NInput, NPopconfirm, NScrollbar } from 'naive-ui'
import { SvgIcon } from '@/components/common'
import { useChatStore, useUserStore } from '@/store'
import { debounce } from '@/utils/functions/debounce'

const route = useRoute()
const userStore = useUserStore()
const chatStore = useChatStore()
const dataSources = ref<any>([])
const { uuid }: any = route.params as { uuid: string }

onMounted(async () => {
  await getSessionList()

  if (uuid !== '0')
    handleSelect({ uuid })
})

async function getSessionList() {
  const user_id = userStore.userInfo.name
  const historyList = await chatStore.getHistoryList({ user_id })

  dataSources.value = historyList
}

// 选中聊天
async function handleSelect({ uuid }: Partial<Chat.History>) {
  if (!uuid)
    return
  if (isActive(uuid))
    return

  if (chatStore.active)
    await chatStore.updateHistory({ uuid: chatStore.active, isEdit: false })
  await chatStore.setActive(uuid)
}
// 保存
async function handleSave({ uuid, title }: Chat.History, event?: MouseEvent) {
  event?.stopPropagation()

  const user_id = userStore.userInfo.name
  await chatStore.updateHistory({ user_id, uuid, isEdit: false, title })
}

// 编辑
async function handleEdit({ uuid }: Chat.History, event?: MouseEvent) {
  event?.stopPropagation()

  await chatStore.updateHistory({ uuid, isEdit: true })
}

// 删除会话
async function handleDelete(index: number, event?: MouseEvent | TouchEvent) {
  event?.stopPropagation()

  const user_id = userStore.userInfo.name
  await chatStore.deleteHistory({ index, user_id })
}

const handleDeleteDebounce = debounce(handleDelete, 600)

// 更改名称
async function handleEnter({ uuid, title }: Chat.History, event: KeyboardEvent) {
  event?.stopPropagation()

  if (event.key === 'Enter') {
    const user_id = userStore.userInfo.name
    await chatStore.updateHistory({ user_id, uuid, isEdit: false, title })
  }
}

function isActive(uuid: string) {
  return chatStore.active === uuid
}
</script>

<template>
  <NScrollbar class="px-4">
    <div class="flex flex-col gap-2 text-sm">
      <template v-if="!dataSources.length">
        <div class="flex flex-col items-center mt-4 text-center text-neutral-300">
          <SvgIcon icon="ri:inbox-line" class="mb-2 text-3xl" />
          <span>{{ $t('common.noData') }}</span>
        </div>
      </template>
      <template v-else>
        <div v-for="(item, index) of dataSources" :key="index">
          <a
            class="relative flex items-center gap-3 px-3 py-3 break-all border rounded-md cursor-pointer hover:bg-neutral-100 group dark:border-neutral-800 dark:hover:bg-[#24272e]"
            :class="isActive(item.uuid) && ['border-[#4b9e5f]', 'bg-neutral-100', 'text-[#4b9e5f]', 'dark:bg-[#24272e]', 'dark:border-[#4b9e5f]', 'pr-14']"
            @click="handleSelect(item)"
          >
            <span>
              <SvgIcon icon="ri:message-3-line" />
            </span>
            <div class="relative flex-1 overflow-hidden break-all text-ellipsis whitespace-nowrap">
              <!-- 更新名称输入框 -->
              <NInput
                v-if="item.isEdit"
                v-model:value="item.title" size="tiny"
                @keypress="handleEnter(item, $event)"
              />
              <span v-else>{{ item.title }}</span>
            </div>
            <div v-if="isActive(item.uuid)" class="absolute z-10 flex visible right-1">
              <!-- 更新名称-保存按钮 -->
              <template v-if="item.isEdit">
                <button class="p-1" @click="handleSave(item, $event)">
                  <SvgIcon icon="ri:save-line" />
                </button>
              </template>
              <!-- 更新名称-编辑按钮 -->
              <template v-else>
                <button class="p-1">
                  <SvgIcon icon="ri:edit-line" @click="handleEdit(item, $event)" />
                </button>
                <!-- 删除 -->
                <NPopconfirm placement="bottom" @positive-click="handleDeleteDebounce(index, $event)">
                  <template #trigger>
                    <button class="p-1">
                      <SvgIcon icon="ri:delete-bin-line" />
                    </button>
                  </template>
                  {{ $t('chat.deleteHistoryConfirm') }}
                </NPopconfirm>
              </template>
            </div>
          </a>
        </div>
      </template>
    </div>
  </NScrollbar>
</template>
