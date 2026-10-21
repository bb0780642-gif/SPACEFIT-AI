import React, { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { ButtonVariant, ComponentSize } from '@/types'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant
  size?: ComponentSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const reducedMotion = useReducedMotion()
    const isDisabled = disabled || isLoading

    const baseStyles =
      'relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer focus-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none rounded-xl'

    const sizeStyles: Record<ComponentSize, string> = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
      md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
      lg: 'text-base px-6 py-3.5 gap-2.5 rounded-xl font-semibold',
    }

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 border border-blue-400/30 active:bg-blue-700',
      secondary:
        'bg-[#131C31] hover:bg-[#1A2642] text-slate-100 border border-blue-500/20 hover:border-blue-500/40 shadow-sm active:bg-[#0F172A]',
      outline:
        'bg-transparent hover:bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:border-blue-400/60 active:bg-blue-500/20',
      ghost:
        'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border border-transparent active:bg-white/10',
      danger:
        'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 hover:border-rose-400/50 active:bg-rose-600/40',
    }

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        whileTap={reducedMotion || isDisabled ? undefined : { scale: 0.98 }}
        whileHover={reducedMotion || isDisabled ? undefined : { scale: 1.01 }}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" aria-hidden="true" />
        )}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
