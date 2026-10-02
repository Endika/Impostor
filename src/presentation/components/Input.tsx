import type { InputHTMLAttributes } from 'react'

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={
        'min-h-12 min-w-0 rounded-2xl border-2 border-line bg-surface px-4 py-2.5 text-lg ' +
        'font-medium text-ink placeholder:text-muted transition-colors ' +
        'focus:border-ink focus:outline-none ' +
        className
      }
      {...rest}
    />
  )
}
