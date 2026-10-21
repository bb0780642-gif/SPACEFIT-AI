import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/utils/cn'

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'interactive' | 'outline'
  glow?: 'none' | 'blue' | 'violet'
  children?: React.ReactNode
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', glow = 'none', children, ...props }, ref) => {
    const variantStyles = {
      default: 'glass-panel rounded-2xl p-6 transition-all duration-300',
      elevated: 'glass-panel-elevated rounded-2xl p-6 transition-all duration-300',
      interactive:
        'glass-panel rounded-2xl p-6 hover:border-blue-500/40 hover:bg-[#131C31]/90 transition-all duration-300 cursor-pointer group',
      outline:
        'bg-transparent border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-300',
    }

    const glowStyles = {
      none: '',
      blue: 'hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]',
      violet: 'hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]',
    }

    return (
      <motion.div
        ref={ref}
        className={cn(variantStyles[variant], glowStyles[glow], className)}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
Card.displayName = 'Card'

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h3
      className={cn('text-xl font-semibold tracking-tight text-white flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p className={cn('text-sm text-slate-400 leading-relaxed', className)} {...props}>
      {children}
    </p>
  )
}

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('text-slate-300', className)} {...props}>
      {children}
    </div>
  )
}

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('flex items-center pt-4 mt-4 border-t border-blue-500/10', className)} {...props}>
      {children}
    </div>
  )
}
