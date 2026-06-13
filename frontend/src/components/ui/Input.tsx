import React, { type ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconPosition = 'left', className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full border border-accent bg-white px-4 py-3 text-sm',
              'focus:outline-none focus:border-black',
              'transition-colors duration-200',
              'placeholder:text-muted',
              error && 'border-[#D32F2F] focus:border-[#D32F2F]',
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              className
            )}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-[#D32F2F]">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
