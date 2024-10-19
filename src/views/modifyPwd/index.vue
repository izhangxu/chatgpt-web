<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NForm, NFormItem, NIcon, NInput, useMessage } from 'naive-ui'
import { LockClosedOutline, PersonOutline } from '@vicons/ionicons5'
import { useUserStore } from '@/store/modules/user'
import loginImage from '@/assets/account-logo.png'
interface FormState {
  username: string
  passwd: string
}

const formRef = ref()
const message = useMessage()
const loading = ref(false)

const formInline = reactive({
  username: '',
  passwd: '',
})

const rules = {
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  passwd: { required: true, message: '请输入密码', trigger: 'blur' },
}

const userStore = useUserStore()
const router = useRouter()

formInline.username = userStore.userInfo.name

const handleSubmit = (e: any) => {
  e.preventDefault()
  formRef.value.validate(async (errors: any) => {
    if (!errors) {
      const { username, passwd } = formInline

      message.loading('修改中...')
      loading.value = true

      const params: FormState = {
        username,
        passwd,
      }

      try {
        const { status, detail: msg } = await userStore.modifyPwd(params)
        message.destroyAll()
        if (status === 'success') {
          message.success('修改成功，请重新登录')
          userStore.resetUserInfo()
          router.replace('/login')
        }
        else {
          message.info(msg || '修改失败')
        }
      }
      finally {
        loading.value = false
      }
    }
    else {
      message.error('请填写完整信息')
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
          修改密码
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
            <NInput v-model:value="formInline.username" readonly disabled placeholder="请输入用户名">
              <template #prefix>
                <NIcon size="18" color="#808695">
                  <PersonOutline />
                </NIcon>
              </template>
            </NInput>
          </NFormItem>
          <NFormItem path="passwd">
            <NInput
              v-model:value="formInline.passwd"
              type="password"
              show-password-on="click"
              placeholder="请输入新密码"
            >
              <template #prefix>
                <NIcon size="18" color="#808695">
                  <LockClosedOutline />
                </NIcon>
              </template>
            </NInput>
          </NFormItem>

          <NFormItem>
            <NButton type="primary" size="large" :loading="loading" block @click="handleSubmit">
              修改
            </NButton>
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
