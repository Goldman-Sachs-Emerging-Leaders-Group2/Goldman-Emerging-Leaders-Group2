import { useEffect, useState } from 'react'

const STORAGE_KEY = 'northline-theme'
const LEGACY_STORAGE_KEY = 'gs-theme'

const normalizeTheme = (value) => (value === 'dark' ? 'dark' : 'light')

export function useTheme() {
  const [theme, setTheme] = useState(() => normalizeTheme(
    localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY),
  ))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
    localStorage.removeItem(LEGACY_STORAGE_KEY)
  }, [theme])

  const toggleTheme = () => setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))

  return { theme, toggleTheme }
}
