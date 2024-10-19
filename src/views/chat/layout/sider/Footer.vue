<script setup lang='ts'>
import { NTooltip } from 'naive-ui'
import { HoverButton, SvgIcon, UserAvatar } from '@/components/common'
import { router } from '@/router'

const goModifyPwdPage = () => {
  router.push('/modify/pwd')
}
</script>

<template>
  <footer class="flex items-center justify-between min-w-0 p-4 overflow-hidden border-t dark:border-neutral-800">
    <div class="flex-1 flex-shrink-0 overflow-hidden">
      <UserAvatar />
    </div>
    <NTooltip trigger="hover">
      <template #trigger>
        <HoverButton @click="goModifyPwdPage">
          <span class="text-xl text-[#4f555e] dark:text-white">
            <SvgIcon icon="ri:settings-4-line" />
          </span>
        </HoverButton>
      </template>
      修改密码
    </NTooltip>
  </footer>
</template>
