import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { post } from '@/utils/request'

export function fetchChatAPI<T = any>(
  prompt: string,
  options?: { conversationId?: string; parentMessageId?: string },
  signal?: GenericAbortSignal,
) {
  return post<T>({
    url: '/chat',
    data: { prompt, options },
    signal,
  })
}

export function fetchChatConfig<T = any>() {
  return post<T>({
    url: '/config',
  })
}

export function fetchChatAPIProcess<T = any>(
  params: {
    user_id: string
    uuid: string
    message: {
      text: string
      image_url?: string
      system?: string
    }
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void },
) {
  const { user_id, uuid, message } = params
  return post<T>({
    url: '/chat/completion',
    data: {
      user_id,
      session_id: uuid,
      message,
    },
    onDownloadProgress: params.onDownloadProgress,
  })
}

export function fetchUserInfo<T>() {
  return post<T>({
    url: '/user',
  })
}

export function fetchVerify<T>(token: string) {
  return post<T>({
    url: '/verify',
    data: { token },
  })
}

export function userLogin<T>(data: any) {
  return post<T>({
    url: '/user/login',
    data,
  })
}

export function userRegister<T>(data: any) {
  return post<T>({
    url: '/user/register',
    data,
  })
}

export function modifyPwd<T>(data: any) {
  return post<T>({
    url: '/user/passwd',
    data,
  })
}

export function sessionCreate<T>(data: any) {
  return post<T>({
    url: '/session/create',
    data,
  })
}

export function sessionChange<T>(data: any) {
  return post<T>({
    url: '/session/change',
    data,
  })
}

export function sessionRename<T>(data: any) {
  return post<T>({
    url: '/session/rename',
    data,
  })
}

export function getSessionList<T>(data: any) {
  return post<T>({
    url: '/session/list',
    data,
  })
}

export function sessionDelete<T>(data: any) {
  return post<T>({
    url: '/session/delete',
    data,
  })
}

export function uploadImages<T>(data: any) {
  return post<T>({
    url: '/chat/images',
    data,
  })
}

export function getChatStream<T>(data: any) {
  return post<T>({
    url: '/chat/stream',
    data,
  })
}

export function chatRegenerate<T>(data: any) {
  return post<T>({
    url: '/chat/regenerate',
    data,
  })
}

export function getFile<T>(data: any) {
  return post<T>({
    url: `/chat/${data.filename}`,
  })
}

export function chatCompletion<T>(data: any) {
  return post<T>({
    url: '/chat/completion',
    data,
  })
}
