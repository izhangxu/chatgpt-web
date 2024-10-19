<script setup lang='ts'>
import { NSpin } from 'naive-ui'
import pkg from '../../../../package.json'
</script>

<template>
  <NSpin>
    <div class="p-4 space-y-4">
      <h2 class="text-xl font-bold">
        Version - {{ pkg.version }}
      </h2>
    </div>
  </NSpin>
</template>
