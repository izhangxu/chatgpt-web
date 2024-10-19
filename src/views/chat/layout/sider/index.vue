<script setup lang='ts'>
import { computed } from 'vue'
import { NButton, NLayoutSider } from 'naive-ui'
import List from './List.vue'
import Footer from './Footer.vue'
import { useAppStore, useChatStore, useUserStore } from '@/store'

const appStore = useAppStore()
const chatStore = useChatStore()
const userStore = useUserStore()

const collapsed: any = computed(() => appStore.siderCollapsed)

async function handleAdd() {
  const user_id = userStore.userInfo.name
  await chatStore.addHistory({ user_id })
}

function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}
</script>

<template>
  <NLayoutSider
    :collapsed="collapsed"
    :collapsed-width="0"
    :width="260"
    show-trigger="arrow-circle"
    collapse-mode="transform"
    position="absolute"
    bordered
    @update-collapsed="handleUpdateCollapsed"
  >
    <div class="flex flex-col h-full">
      <main class="flex flex-col flex-1 min-h-0">
        <!-- 新建聊天 -->
        <div class="p-4">
          <NButton dashed block @click="handleAdd">
            {{ $t('chat.newChatButton') }}
          </NButton>
        </div>
        <!-- 聊天列表 -->
        <div class="flex-1 min-h-0 pb-4 overflow-hidden">
          <List />
        </div>
      </main>
      <Footer />
    </div>
  </NLayoutSider>
</template>
