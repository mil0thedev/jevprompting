import { useCallback, useEffect, useState } from 'react'
import { THEME_STORAGE_KEY } from '@/config'
import { readStorage, writeStorage } from '@/lib/storage'

export type Theme = 'light' | 'dark'

const initialTheme = (): Theme => {
  const stored = readStorage(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark'
      writeStorage(THEME_STORAGE_KEY, next)
      return next
    })
  }, [])

  return { theme, toggleTheme }
}
