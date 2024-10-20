import { ss } from '@/utils/storage'

const LOCAL_NAME = 'chatStorage'

export function defaultState(): Chat.ChatState {
  const uuid = '0'
  return {
    active: uuid,
    usingContext: true,
    // history: [{ uuid, title: t('chat.newChatTitle'), isEdit: false, chat: [] }],
    history: [],
    chat: [],
  }
}

export function getLocalState(): Chat.ChatState {
  const localState = ss.get(LOCAL_NAME)
  return { ...defaultState(), ...localState }
}

export function setLocalState(state: Chat.ChatState) {
  ss.set(LOCAL_NAME, state)
}
