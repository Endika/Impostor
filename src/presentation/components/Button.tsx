import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'positive' | 'warn' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const base =
  'inline-flex select-none items-center justify-center gap-2 rounded-2xl font-bold ' +
  'transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out ' +
  'active:translate-y-px focus-visible:outline-none focus-visible:ring-3 ' +
  'focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground ' +
  'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-surface disabled:text-muted ' +
  'disabled:shadow-none disabled:active:translate-y-0'

const sizes: Record<Size, string> = {
  // min 44px tap targets for pass-the-phone use
  sm: 'min-h-11 px-3 py-2 text-sm',
  md: 'min-h-11 px-4 py-2.5 text-base',
  lg: 'min-h-14 px-5 py-3.5 text-lg',
  icon: 'h-12 w-12 shrink-0 p-0',
}

// Every coloured fill carries dark ink; colour alone never carries meaning.
const variants: Record<Variant, string> = {
  primary: 'bg-brand text-on-color shadow-press hover:bg-brand-hover active:bg-brand-press',
  secondary:
    'border-2 border-line bg-raised text-ink shadow-press hover:border-line-strong active:bg-surface',
  ghost: 'text-muted hover:bg-raised hover:text-ink active:bg-surface',
  positive: 'bg-positive text-on-color shadow-press hover:bg-positive-hover',
  warn: 'bg-warn text-on-color shadow-press hover:bg-warn-hover',
  danger: 'bg-danger text-on-color shadow-press hover:bg-danger-hover',
}

/** `className` is for layout (width, margins); colour comes only from the variant. */
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
