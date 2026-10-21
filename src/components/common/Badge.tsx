import React from 'react'
import { cn } from '@/utils/cn'

export type BadgeVariant = 'blue' | 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'subtle'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
  children: React.ReactNode
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'blue',
  dot = false,
  className,
  children,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    blue: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    violet: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    subtle: 'bg-slate-800/60 text-slate-300 border-slate-700/50',
  }

  const dotColors: Record<BadgeVariant, string> = {
    blue: 'bg-blue-400',
    violet: 'bg-purple-400',
    cyan: 'bg-cyan-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    subtle: 'bg-slate-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', dotColors[variant])} />
      )}
      {children}
    </span>
  )
}
