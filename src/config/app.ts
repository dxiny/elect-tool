export type AppConfig = {
  apiBaseUrl: string
  assetsBaseUrl?: string
  domain?: string
  imageBasePath?: string
  ip?: string
}

const KEY = 'appConfig'

export const getConfig = (): AppConfig => {
  try {
    const t = localStorage.getItem(KEY)
    const j = t ? JSON.parse(t) : {}
    return { apiBaseUrl: j.apiBaseUrl || '', assetsBaseUrl: j.assetsBaseUrl || '', domain: j.domain || '', imageBasePath: j.imageBasePath || '', ip: j.ip || '' }
  } catch {
    return { apiBaseUrl: '' }
  }
}

export const setConfig = (patch: Partial<AppConfig>) => {
  const curr = getConfig()
  const next = { ...curr, ...patch }
  localStorage.setItem(KEY, JSON.stringify(next))
  if (next.apiBaseUrl) {
    try { localStorage.setItem('apiBaseUrl', next.apiBaseUrl) } catch {}
  }
}
