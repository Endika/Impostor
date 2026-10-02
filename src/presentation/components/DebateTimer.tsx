import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { Button } from './Button'

const CHOICES = [0, 1, 2, 3, 5] as const
const STORAGE_KEY = 'impostor.timerMinutes'
export const TENSE_FROM_SECONDS = 30

function loadMinutes(): number {
  try {
    const value = Number(window.localStorage.getItem(STORAGE_KEY))
    return (CHOICES as readonly number[]).includes(value) ? value : 0
  } catch {
    return 0
  }
}

function saveMinutes(minutes: number): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(minutes))
  } catch {
    // ignore persistence failures
  }
}

const format = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

// A countdown outlives the screen while the round lasts, so leaving for a
// guess and coming back neither resets nor stops it.
let memory: { key: string; left: number; running: boolean; at: number } | null = null

interface DebateTimerProps {
  /** Identifies the round; a new key starts a fresh countdown. */
  roundKey: string
  /** Fires on every second while running, and on start, pause and reset. */
  onTick?: (secondsLeft: number, running: boolean) => void
  onTimeUp?: () => void
}

/** Optional debate countdown; off by default and remembered between games. */
export function DebateTimer({ roundKey, onTick, onTimeUp }: DebateTimerProps) {
  const { t } = useTranslation()
  const [minutes, setMinutes] = useState(loadMinutes)
  const [restored] = useState(() => {
    if (!memory || memory.key !== roundKey) return null
    const elapsed = memory.running ? Math.floor((Date.now() - memory.at) / 1000) : 0
    return { left: Math.max(0, memory.left - elapsed), running: memory.running }
  })
  const [left, setLeft] = useState(() => restored?.left ?? minutes * 60)
  const [running, setRunning] = useState(() => (restored?.running ?? false) && left > 0)
  const leftRef = useRef(left)
  const callbacks = useRef({ onTick, onTimeUp })

  useEffect(() => {
    callbacks.current = { onTick, onTimeUp }
  })

  useEffect(() => {
    memory = { key: roundKey, left, running, at: Date.now() }
  }, [roundKey, left, running])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const next = Math.max(0, leftRef.current - 1)
      leftRef.current = next
      setLeft(next)
      if (next === 0) {
        setRunning(false)
        callbacks.current.onTick?.(0, false)
        callbacks.current.onTimeUp?.()
      } else {
        callbacks.current.onTick?.(next, true)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  function choose(value: number) {
    setMinutes(value)
    saveMinutes(value)
    setRunning(false)
    leftRef.current = value * 60
    setLeft(value * 60)
    onTick?.(value * 60, false)
  }

  function toggleRunning() {
    const next = !running
    setRunning(next)
    onTick?.(leftRef.current, next)
  }

  return (
    <div className="flex flex-col gap-4">
      {minutes > 0 && (
        <div className="flex flex-col items-center gap-3">
          <span
            role="timer"
            className={`text-[3.75rem] leading-none [@media(min-height:740px)]:text-[5.5rem] font-extrabold tracking-tight tabular-nums ${
              left === 0 ? 'text-danger' : left <= TENSE_FROM_SECONDS ? 'text-warn' : 'text-ink'
            }`}
          >
            {left === 0 ? t('timer.timeUp') : format(left)}
          </span>
          <span className="flex gap-3">
            <Button
              variant="secondary"
              size="icon"
              aria-label={t('timer.reset')}
              onClick={() => choose(minutes)}
            >
              <RotateCcw aria-hidden size={22} strokeWidth={2.5} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label={running ? t('timer.pause') : t('timer.start')}
              disabled={left === 0}
              onClick={toggleRunning}
            >
              {running ? (
                <Pause aria-hidden size={22} strokeWidth={2.75} />
              ) : (
                <Play aria-hidden size={22} strokeWidth={2.75} />
              )}
            </Button>
          </span>
        </div>
      )}

      <p aria-live="polite" className="sr-only">
        {minutes > 0 && left === 0
          ? t('timer.timeUp')
          : running && left <= TENSE_FROM_SECONDS
            ? t('timer.lastSeconds', { count: TENSE_FROM_SECONDS })
            : ''}
      </p>

      <div
        role="radiogroup"
        aria-label={t('timer.label')}
        className="grid grid-cols-5 gap-1 rounded-2xl bg-ground p-1"
      >
        {CHOICES.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={minutes === value}
            className={`min-h-11 rounded-xl px-0.5 text-sm font-bold transition-colors focus-visible:ring-3 focus-visible:ring-brand/70 focus-visible:outline-none ${
              minutes === value ? 'bg-raised text-ink' : 'text-muted hover:text-ink'
            }`}
            onClick={() => choose(value)}
          >
            {value === 0 ? t('timer.off') : t('timer.minutes', { count: value })}
          </button>
        ))}
      </div>
    </div>
  )
}
