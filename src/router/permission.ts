import type { Router } from 'vue-router'
// import { useUserStoreWithout } from '@/store/modules/user'

export function setupPageGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    // const authStore = useUserStoreWithout()
    // if (!authStore.logined) {
    //
    // }
    // else {
    //   next()
    // }
    next()
  })
}
