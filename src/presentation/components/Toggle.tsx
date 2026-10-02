import { useId } from 'react'

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  /** Why the toggle is unavailable, shown under the label while disabled. */
  disabledReason?: string
}

/** A labelled on/off switch row; the whole row is the hit target. */
export function Toggle({ label, checked, onChange, disabled, disabledReason }: ToggleProps) {
  const labelId = useId()
  const hintId = useId()
  const showHint = disabled && disabledReason
  return (
    <label
      className={`flex min-h-12 items-center justify-between gap-4 py-2 ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <span className="flex min-w-0 flex-col">
        <span id={labelId} className={disabled ? 'text-muted' : 'text-ink'}>
          {label}
        </span>
        {showHint && (
          <span id={hintId} className="text-sm text-muted">
            {disabledReason}
          </span>
        )}
      </span>
      <input
        type="checkbox"
        role="switch"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        aria-labelledby={labelId}
        aria-describedby={showHint ? hintId : undefined}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        aria-hidden
        className={
          'relative h-8 w-13 shrink-0 rounded-full border-2 border-line bg-raised transition-colors ' +
          'after:absolute after:left-0.5 after:top-0.5 after:h-6 after:w-6 after:rounded-full ' +
          'after:bg-muted after:transition-transform after:duration-200 after:ease-out ' +
          'peer-checked:border-ink peer-checked:bg-ink peer-checked:after:translate-x-5 ' +
          'peer-checked:after:bg-ground peer-focus-visible:ring-3 peer-focus-visible:ring-brand/70 ' +
          'peer-disabled:opacity-40'
        }
      />
    </label>
  )
}
