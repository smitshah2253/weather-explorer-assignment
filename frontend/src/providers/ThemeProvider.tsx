import React, { createContext, useEffect, useState } from 'react'
import type { Theme, ThemeProviderState } from '@/types/theme'

const THEME_STORAGE_KEY = 'weather-explorer-theme'

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
}

export const ThemeContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = THEME_STORAGE_KEY,
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme)
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
