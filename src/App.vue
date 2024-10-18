<script setup lang="ts">
import { NConfigProvider } from 'naive-ui'
import { NaiveProvider } from '@/components/common'
import { useLanguage } from '@/hooks/useLanguage'

const { language } = useLanguage()
</script>

<template>
  <NConfigProvider
    class="h-full"
    :locale="language"
  >
    <NaiveProvider>
      <RouterView />
    </NaiveProvider>
  </NConfigProvider>
</template>
