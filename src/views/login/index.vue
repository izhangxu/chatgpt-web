<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NCheckbox, NForm, NFormItem, NIcon, NInput, useMessage } from 'naive-ui'
import { LockClosedOutline, PersonOutline } from '@vicons/ionicons5'
import { useUserStore } from '@/store/modules/user'
import loginImage from '@/assets/account-logo.png'
interface FormState {
  username: string
  password: string
}

const formRef = ref()
const message = useMessage()
const loading = ref(false)
const autoLogin = ref(true)

const formInline = reactive({
  username: 'admin',
  password: '123456',
  isCaptcha: true,
})

const rules = {
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  password: { required: true, message: '请输入密码', trigger: 'blur' },
}

const userStore = useUserStore()

const router = useRouter()
const route = useRoute()

const handleSubmit = (e: any) => {
  e.preventDefault()
  formRef.value.validate(async (errors: any) => {
    if (!errors) {
      const { username, password } = formInline
      message.loading('登录中...')
      loading.value = true

      const params: FormState = {
        username,
        password,
      }

      try {
        const { code, message: msg } = await userStore.login(params)
        message.destroyAll()
        if (code === 0) {
          const toPath = decodeURIComponent((route.query?.redirect || '/') as string)
          message.success('登录成功，即将进入系统')
          if (route.name === '/login')
            router.replace('/')
          else router.replace(toPath)
        }
        else {
          message.info(msg || '登录失败')
        }
      }
      finally {
        loading.value = false
      }
    }
    else {
      message.error('请填写完整信息，并且进行验证码校验')
    }
  })
}
</script>

<template>
  <div class="view-account">
    <div class="view-account-header" />
    <div class="view-account-container">
      <div class="view-account-top">
        <div class="view-account-top-logo">
          <img :src="loginImage" alt="">
        </div>
        <div class="view-account-top-desc">
          用户登录
        </div>
      </div>
      <div class="view-account-form">
        <NForm
          ref="formRef"
          label-placement="left"
          size="large"
          :model="formInline"
          :rules="rules"
        >
          <NFormItem path="username">
            <NInput v-model:value="formInline.username" placeholder="请输入用户名">
              <template #prefix>
                <NIcon size="18" color="#808695">
                  <PersonOutline />
                </NIcon>
              </template>
            </NInput>
          </NFormItem>
          <NFormItem path="password">
            <NInput
              v-model:value="formInline.password"
              type="password"
              show-password-on="click"
              placeholder="请输入密码"
            >
              <template #prefix>
                <NIcon size="18" color="#808695">
                  <LockClosedOutline />
                </NIcon>
              </template>
            </NInput>
          </NFormItem>
          <NFormItem class="default-color">
            <div class="flex justify-between">
              <div class="flex-initial">
                <NCheckbox v-model:checked="autoLogin">
                  自动登录
                </NCheckbox>
              </div>
              <div class="flex-initial order-last">
                <a href="javascript:">忘记密码</a>
              </div>
            </div>
          </NFormItem>
          <NFormItem>
            <NButton type="primary" size="large" :loading="loading" block @click="handleSubmit">
              登录
            </NButton>
          </NFormItem>
          <NFormItem class="default-color">
            <div class="flex view-account-other">
              <div class="flex-initial" style="margin-left: auto">
                <a href="javascript:">注册账号</a>
              </div>
            </div>
          </NFormItem>
        </NForm>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .view-account {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: auto;

    &-container {
      flex: 1;
      padding: 32px 12px;
      max-width: 384px;
      min-width: 320px;
      margin: 0 auto;
    }

    &-top {
      padding: 32px 0;
      text-align: center;

      &-desc {
        font-size: 14px;
        color: #808695;
      }
    }

    &-other {
      width: 100%;
    }

    .default-color {
      color: #515a6e;

      .ant-checkbox-wrapper {
        color: #515a6e;
      }
    }
  }

  @media (min-width: 768px) {
    .view-account {
      background-image: url('../../assets/images/login.svg');
      background-repeat: no-repeat;
      background-position: 50%;
      background-size: 100%;
    }

    .page-account-container {
      padding: 32px 0 24px 0;
    }
  }
</style>
