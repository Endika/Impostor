import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger'
type Size = 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const base =
  'inline-flex select-none items-center justify-center rounded-2xl font-semibold ' +
  'transition-all duration-150 active:scale-[0.97] focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950 ' +
  'disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 ' +
  'disabled:shadow-none'

const sizes: Record<Size, string> = {
  // min ~44px tap targets for pass-the-phone mobile use
  md: 'min-h-11 px-4 py-2.5 text-base',
  lg: 'min-h-13 px-5 py-3.5 text-lg',
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-600/25 ' +
    'hover:from-brand-400 hover:to-brand-500 active:from-brand-600 active:to-brand-700',
  secondary:
    'border border-slate-300/80 bg-white/80 text-slate-800 shadow-sm backdrop-blur ' +
    'hover:bg-white active:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/70 ' +
    'dark:text-slate-100 dark:hover:bg-slate-800 dark:active:bg-slate-700/70',
  ghost:
    'border border-slate-300/70 text-slate-700 hover:bg-slate-100 ' +
    'active:bg-slate-200 dark:border-slate-700 dark:text-slate-200 ' +
    'dark:hover:bg-slate-800 dark:active:bg-slate-700',
  success:
    'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-600/25 ' +
    'hover:from-emerald-400 hover:to-emerald-500 active:from-emerald-600 active:to-emerald-700',
  danger:
    'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-lg shadow-red-600/25 ' +
    'hover:from-red-400 hover:to-red-500 active:from-red-600 active:to-red-700',
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
