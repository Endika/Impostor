import type { ButtonHTMLAttributes } from 'react'
import { Check } from 'lucide-react'

interface PlayerRowProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  name: string
  /** Set for single-choice lists (rendered as a radio); omit for plain picks. */
  selected?: boolean
}

/** A full-width player choice, big enough to hit while passing the phone. */
export function PlayerRow({ name, selected, className = '', ...rest }: PlayerRowProps) {
  const isChoice = selected !== undefined
  return (
    <button
      type="button"
      role={isChoice ? 'radio' : undefined}
      aria-checked={isChoice ? selected : undefined}
      className={
        'flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 ' +
        'text-left text-lg font-bold transition-[border-color,background-color] duration-150 ' +
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/70 ' +
        (selected
          ? 'border-ink bg-raised text-ink '
          : 'border-line bg-surface text-ink hover:border-line-strong ') +
        className
      }
      {...rest}
    >
      <span className="min-w-0 [overflow-wrap:anywhere]">{name}</span>
      {isChoice && (
        <span
          aria-hidden
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? 'border-ink bg-ink text-ground' : 'border-line-strong'
          }`}
        >
          {selected && <Check size={18} strokeWidth={3} />}
        </span>
      )}
    </button>
  )
}
