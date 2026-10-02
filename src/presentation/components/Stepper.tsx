import { Minus, Plus } from 'lucide-react'
import { Button } from './Button'

interface StepperProps {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  label: string
  decreaseLabel: string
  increaseLabel: string
  disabled?: boolean
}

export function Stepper({
  value,
  min,
  max,
  onChange,
  label,
  decreaseLabel,
  increaseLabel,
  disabled,
}: StepperProps) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-3">
      <Button
        variant="secondary"
        aria-label={decreaseLabel}
        size="icon"
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus aria-hidden size={22} strokeWidth={2.75} />
      </Button>
      <output
        aria-live="polite"
        className={`min-w-10 text-center text-3xl font-extrabold tabular-nums ${
          disabled ? 'text-muted' : 'text-ink'
        }`}
      >
        {value}
      </output>
      <Button
        variant="secondary"
        aria-label={increaseLabel}
        size="icon"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus aria-hidden size={22} strokeWidth={2.75} />
      </Button>
    </div>
  )
}
