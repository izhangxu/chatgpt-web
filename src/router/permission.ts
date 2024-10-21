import type { Router } from 'vue-router'
import Cookies from 'js-cookie'
import { useUserStoreWithout } from '@/store/modules/user'

export function setupPageGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useUserStoreWithout()
    const user_id = Cookies.get('user_id')
    console.log(user_id)
    if (user_id)
      authStore.updateUserInfo({ name: user_id })

    next()
  })
}
