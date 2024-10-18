import { ss } from '@/utils/storage'

const LOCAL_NAME = 'appSetting'

export type Language = 'en-US' | 'zh-CN'

const languageMap: { [key: string]: Language } = {
  'en': 'en-US',
  'en-US': 'en-US',
  'zh': 'zh-CN',
  'zh-CN': 'zh-CN',
}

export interface AppState {
  siderCollapsed: Boolean
  language: Language
}

export function defaultSetting(): AppState {
  const language = languageMap[navigator.language]
  return { siderCollapsed: false, language }
}

export function getLocalSetting(): AppState {
  const localSetting: AppState | undefined = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalSetting(setting: AppState): void {
  ss.set(LOCAL_NAME, setting)
}
