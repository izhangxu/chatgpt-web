<script lang="ts" setup>
import { computed, ref } from 'vue'
import { NButton, NInput, useMessage } from 'naive-ui'
import { useUserStore } from '@/store'
import type { UserInfo } from '@/store/modules/user/helper'
import { t } from '@/locales'

const userStore = useUserStore()

const ms = useMessage()

const userInfo = computed(() => userStore.userInfo)

const avatar = ref(userInfo.value.avatar ?? '')

const name = ref(userInfo.value.name ?? '')

function updateUserInfo(options: Partial<UserInfo>) {
  userStore.updateUserInfo({ userInfo: options })
  ms.success(t('common.success'))
}
</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
      <!-- 头像 -->
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.avatarLink') }}</span>
        <div class="flex-1">
          <NInput v-model:value="avatar" placeholder="" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateUserInfo({ avatar })">
          {{ $t('common.save') }}
        </NButton>
      </div>
      <!-- 昵称 -->
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.name') }}</span>
        <div class="w-[200px]">
          <NInput v-model:value="name" placeholder="" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateUserInfo({ name })">
          {{ $t('common.save') }}
        </NButton>
      </div>
    </div>
  </div>
</template>
