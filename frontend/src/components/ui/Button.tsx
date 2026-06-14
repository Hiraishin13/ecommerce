import React from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { cn } from '../../utils/cn'
import Spinner from './Spinner'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant
  size?:     ButtonSize
  loading?:  boolean
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-black text-white hover:bg-[#333] border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'bg-transparent text-black border-2 border-black hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent text-black border-2 border-transparent hover:border-black disabled:opacity-50 disabled:cursor-not-allowed',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, fullWidth = false, className, children, disabled, ...props }, ref) => {
    const reduced = useReducedMotion()

    return (
      <m.button
        ref={ref}
        disabled={disabled || loading}
        whileTap={!disabled && !loading && !reduced ? { scale: 0.97 } : {}}
        transition={{ duration: 0.1 }}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'uppercase tracking-widest font-bold',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...(props as React.ComponentPropsWithoutRef<typeof m.button>)}
      >
        {loading && <Spinner size="sm" color={variant === 'primary' ? 'white' : 'black'} />}
        {children}
      </m.button>
    )
  }
)

Button.displayName = 'Button'
export default Button
