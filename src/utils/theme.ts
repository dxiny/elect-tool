export const setCssVar = (name: string, value: string) => {
  document.documentElement.style.setProperty(name, value)
}

export const getCssVar = (name: string, fallback = '') => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name)
  return v?.trim() || fallback
}

export const initThemeVars = () => {
  const primary = getCssVar('--primary-color', '#1677ff')
  const start = `color-mix(in srgb, ${primary}, white 20%)`
  const end = `color-mix(in srgb, ${primary}, #8b5cf6 20%)`
  const activeBg = `color-mix(in srgb, ${primary}, white 85%)`

  setCssVar('--brand-primary', primary)
  setCssVar('--brand-gradient-start', start)
  setCssVar('--brand-gradient-end', end)
  setCssVar('--sidebar-active-bg', activeBg)
  setCssVar('--sidebar-active-text', primary)
}

export const setPrimaryColor = (color: string) => {
  setCssVar('--primary-color', color)
  initThemeVars()
}
