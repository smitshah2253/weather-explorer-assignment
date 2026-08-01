export type Theme = 'dark' | 'light' | 'system'

export interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}
