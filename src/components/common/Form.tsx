import React, { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { AlertCircle } from 'lucide-react'

// LABEL
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5', className)}
        {...props}
      >
        {children}
        {required && <span className="text-rose-400 ml-1" aria-hidden="true">*</span>}
      </label>
    )
  }
)
Label.displayName = 'Label'

// INPUT
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, leftIcon, rightIcon, id, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error && id ? `${id}-error` : undefined}
          className={cn(
            'w-full bg-[#0B1120] text-slate-100 placeholder:text-slate-500 rounded-xl px-4 py-2.5 text-sm',
            'border border-blue-500/20 hover:border-blue-500/35 focus:border-blue-500 focus-ring',
            'transition-colors duration-150',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-rose-500/60 focus:border-rose-500',
            className
          )}
          {...props}
        />
        {rightIcon && !error && (
          <div className="absolute right-3.5 text-slate-400 pointer-events-none flex items-center">
            {rightIcon}
          </div>
        )}
        {error && (
          <div className="absolute right-3.5 text-rose-400 pointer-events-none flex items-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

// SELECT
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, id, ...props }, ref) => {
    return (
      <select
        ref={ref}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error && id ? `${id}-error` : undefined}
        className={cn(
          'w-full bg-[#0B1120] text-slate-100 rounded-xl px-4 py-2.5 text-sm',
          'border border-blue-500/20 hover:border-blue-500/35 focus:border-blue-500 focus-ring',
          'transition-colors duration-150 appearance-none cursor-pointer',
          'bg-[radial-gradient(ellipse_at_right,rgba(59,130,246,0.1),transparent)]',
          error && 'border-rose-500/60 focus:border-rose-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = 'Select'

// TEXTAREA
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, id, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error && id ? `${id}-error` : undefined}
        className={cn(
          'w-full bg-[#0B1120] text-slate-100 placeholder:text-slate-500 rounded-xl px-4 py-3 text-sm min-h-[100px]',
          'border border-blue-500/20 hover:border-blue-500/35 focus:border-blue-500 focus-ring',
          'transition-colors duration-150 resize-y',
          error && 'border-rose-500/60 focus:border-rose-500',
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

// FORM FIELD WRAPPER
export interface FormFieldProps {
  label?: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-1.5 w-full', className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} className="text-xs text-rose-400 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
