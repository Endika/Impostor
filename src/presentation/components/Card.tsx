import type { HTMLAttributes } from 'react'

/**
 * Reusable rounded surface used across screens for sections, banners and
 * option groups. Frosted, soft-shadowed, dark-mode aware. Pass `className`
 * to tweak padding/tone per use.
 */
export function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={
        'rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm ' +
        'backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60 ' +
        className
      }
      {...rest}
    />
  )
}

/** A small uppercase section heading, kept consistent everywhere. */
export function SectionLabel({ className = '', ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={
        'text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400 ' +
        className
      }
      {...rest}
    />
  )
}
