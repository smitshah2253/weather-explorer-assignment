import React from 'react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './ThemeProvider'
import { QueryProvider } from './QueryProvider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            className: 'bg-card text-card-foreground border border-border shadow-lg text-sm rounded-xl',
          }}
        />
      </QueryProvider>
    </ThemeProvider>
  )
}
