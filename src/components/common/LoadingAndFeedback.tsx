import React from 'react'
import { Loader2, AlertTriangle, Inbox } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/common/Button'

// LOADING SPINNER
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Loading spatial data...',
  className,
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-6 space-y-3', className)} role="status">
      <div className="relative">
        <Loader2 className={cn('animate-spin text-blue-500', sizeMap[size])} />
        <div className="absolute inset-0 rounded-full blur-md bg-blue-500/20 pointer-events-none" />
      </div>
      {label && <p className="text-xs uppercase tracking-wider text-slate-400 font-mono">{label}</p>}
      <span className="sr-only">{label}</span>
    </div>
  )
}

// SKELETON LOADER
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  shimmer = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-xl bg-[#111A2E]/80 relative overflow-hidden',
        shimmer &&
          'after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.8s_infinite] after:bg-gradient-to-r after:from-transparent after:via-blue-500/10 after:to-transparent',
        className
      )}
      {...props}
    />
  )
}

// EMPTY STATE
export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-12 glass-panel rounded-2xl border-dashed border-blue-500/20 max-w-lg mx-auto',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 shadow-inner shadow-blue-500/10">
        {icon || <Inbox className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

// ERROR STATE
export interface ErrorStateProps {
  title?: string
  message: string
  retryLabel?: string
  onRetry?: () => void
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  retryLabel = 'Try Again',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 glass-panel rounded-2xl border-rose-500/30 max-w-lg mx-auto',
        className
      )}
      role="alert"
    >
      <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 max-w-sm">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
