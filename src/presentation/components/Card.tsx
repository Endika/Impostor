import type { HTMLAttributes } from 'react'

/** The one surface recipe: a flat panel on the ground. */
export function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-3xl border-2 border-line bg-surface ${className}`} {...rest} />
}

/** A section heading inside a screen. */
export function SectionLabel({ className = '', ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={`text-base font-bold text-ink ${className}`} {...rest} />
}
