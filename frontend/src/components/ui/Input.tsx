import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id || generatedId

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-foreground/80 tracking-wide select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-muted-foreground pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-muted-foreground pointer-events-none flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs font-medium text-destructive">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
