import React from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full'
}

export function PageContainer({
  className,
  maxWidth = '7xl',
  children,
  ...props
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  }

  return (
    <div
      className={cn(
        'mx-auto w-full p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200',
        maxWidthClasses[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
