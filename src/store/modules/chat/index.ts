import { defineStore } from 'pinia'
import { defaultState, getLocalState, setLocalState } from './helper'
import { router } from '@/router'
import { getSessionList, sessionCreate, sessionDelete, sessionRename } from '@/api'

export const useChatStore = defineStore('chat-store', {
  state: (): Chat.ChatState => getLocalState(),

  getters: {
    getHistoryByCurrentActive(state: Chat.ChatState) {
      const index = state.history.findIndex(item => item.uuid === state.active)
      if (index !== -1)
        return state.history[index]
      return null
    },
  },

  actions: {
    async getHistoryList(params: any) {
      const res: any = await getSessionList(params)
      const { sessions } = res

      const history = sessions.map((e: any) => {
        const [uuid, title] = e
        return {
          uuid,
          title,
          chat: [],
        }
      })

      this.history = history
      return history
    },

    setUsingContext(context: boolean) {
      this.usingContext = context
      this.recordState()
    },

    async addHistory(params: any) {
      const res: any = await sessionCreate(params)

      if (res.status === 'success') {
        const [session] = res.sessions
        const [uuid, title] = session

        this.history.unshift({ title, uuid, isEdit: false, chat: [] })
        this.active = uuid
        this.reloadRoute(uuid)
      }

      return res
    },

    async updateHistory(params: any) {
      const { uuid, user_id, title } = params

      const _update = () => {
        const index = this.history.findIndex(item => item.uuid === uuid)
        if (index !== -1) {
          this.history[index] = { ...this.history[index], ...params }
          this.recordState()
        }
      }
      // 更新名称
      if (title) {
        const res: any = await sessionRename({ session_id: uuid, user_id, session_name: title })

        if (res.status === 'success')
          _update()
      }
      else {
        _update()
      }
    },

    async deleteHistory(params: any) {
      const { index, user_id } = params
      const { uuid }: any = this.history.find((e, i) => i === index)
      const res: any = await sessionDelete({ session_id: uuid, user_id })

      if (res.status !== 'success')
        return
      this.history.splice(index, 1)

      if (this.history.length === 0) {
        this.active = null
        this.reloadRoute()
        return
      }

      if (index > 0 && index <= this.history.length) {
        const uuid = this.history[index - 1].uuid
        this.active = uuid
        this.reloadRoute(uuid)
        return
      }

      if (index === 0) {
        if (this.history.length > 0) {
          const uuid = this.history[0].uuid
          this.active = uuid
          this.reloadRoute(uuid)
        }
      }

      if (index > this.history.length) {
        const uuid = this.history[this.history.length - 1].uuid
        this.active = uuid
        this.reloadRoute(uuid)
      }
    },

    async setActive(uuid: number) {
      this.active = uuid
      return await this.reloadRoute(uuid)
    },

    getChatList(uuid: number) {
      const index = this.history.findIndex(item => item.uuid === uuid)
      console.log(this.history[0])
      if (index !== -1)
        return this.history[index]?.chat
      return []
    },

    getChatByUuid(uuid: number, index: number) {
      const historyIndex = this.history.findIndex(item => item.uuid === uuid)
      if (historyIndex !== -1)
        return this.history[historyIndex].chat[index]
      return null
    },

    addChatByUuid(uuid: number, chat: Chat.Chat) {
      const index = this.history.findIndex(item => item.uuid === uuid)
      if (index !== -1) {
        this.history[index].chat.push(chat)
        this.recordState()
      }
    },

    updateChatByUuid(uuid: number, index: number, chat: Chat.Chat) {
      const historyIndex = this.history.findIndex(item => item.uuid === uuid)
      if (historyIndex !== -1) {
        this.history[index].chat[index] = chat
        this.recordState()
      }
    },

    updateChatSomeByUuid(uuid: number, index: number, chat: Partial<Chat.Chat>) {
      const historyIndex = this.history.findIndex(item => item.uuid === uuid)
      if (historyIndex !== -1) {
        this.history[historyIndex].chat[index] = { ...this.history[historyIndex].chat[index], ...chat }
        this.recordState()
      }
    },

    deleteChatByUuid(uuid: number, index: number) {
      const historyIndex = this.history.findIndex(item => item.uuid === uuid)

      if (historyIndex !== -1) {
        this.history[historyIndex].chat.splice(index, 1)
        this.recordState()
      }
    },

    clearChatByUuid(uuid: number) {
      const historyIndex = this.history.findIndex(item => item.uuid === uuid)

      if (historyIndex !== -1) {
        this.history[historyIndex].chat = []
        this.recordState()
      }
    },

    clearHistory() {
      this.$state = { ...defaultState() }
      this.recordState()
    },

    async reloadRoute(uuid?: number) {
      this.recordState()
      await router.push({ name: 'Chat', params: { uuid } })
    },

    recordState() {
      setLocalState(this.$state)
    },
  },
})
