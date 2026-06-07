import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const base =
  'inline-flex select-none items-center justify-center rounded-xl font-semibold ' +
  'transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-brand-400 focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-slate-100 dark:focus-visible:ring-offset-slate-950 ' +
  'disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100'

const sizes: Record<Size, string> = {
  // min ~44px tap targets for pass-the-phone mobile use
  md: 'min-h-11 px-4 py-2.5 text-base',
  lg: 'min-h-12 px-5 py-3.5 text-lg',
}

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-500 active:bg-brand-700',
  secondary:
    'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 ' +
    'active:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 ' +
    'dark:text-slate-100 dark:hover:bg-slate-700 dark:active:bg-slate-700/70',
  ghost:
    'border border-slate-300 text-slate-700 hover:bg-slate-100 ' +
    'active:bg-slate-200 dark:border-slate-700 dark:text-slate-200 ' +
    'dark:hover:bg-slate-800 dark:active:bg-slate-700',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    />
  )
}
