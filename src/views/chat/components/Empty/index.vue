<script setup lang='ts'></script>

<template>
  <div class="w-full h-full flex flex-col">
    <div class="text-4xl font-bold">
      <h3>天佑大模型<span class="text-2xl text-gray-300 ml-1">2.0</span></h3>
    </div>
    <div class="flex-1 flex items-center justify-center flex-col ">
      <div class="flex items-center justify-between">
        <img width="135" src="@/assets/bjtu-logo.svg" alt="">
        <div class="ml-6">
          <h4 class="text-5xl font-bold mb-6">
            你好，我是天佑大模型
          </h4>
          <p class="text-gray-500 text-2xl">
            我可以帮你做这些事情，
          </p>
        </div>
      </div>
      <div class="flex items-center justify-center mt-4" style="width: 660px;">
        <div class="flex items-center justify-center flex-row border border-gray-150 rounded-xl p-3 mr-2">
          <h5 class="text-2xl font-bold mr-4">
            缺陷检测
          </h5>
          <p class="text-gray-500 text-xl">
            自动识别轨道图像中存在的缺陷病害
          </p>
        </div>
        <div class="flex items-center justify-center flex-row border border-gray-150 rounded-xl p-3 mr-2">
          <h5 class="text-2xl font-bold mr-4">
            运维建议
          </h5>
          <p class="text-gray-500 text-xl">
            针对轨道的缺陷病害提出定制化运维方案
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
