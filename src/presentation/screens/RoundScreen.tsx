import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../state/useGame'
import { useAudio } from '../audio/useAudio'
import { Button } from '../components/Button'
import type { Rng } from '../../domain/game/types'

interface RoundScreenProps {
  rng?: Rng
}

export function RoundScreen({ rng = Math.random }: RoundScreenProps) {
  const { t } = useTranslation()
  const { state, dispatch } = useGame()
  const { startLoop, stopLoop, muted } = useAudio()

  const assignment = state.assignment

  // Pick the starting player once on mount among alive players only;
  // tests inject a deterministic rng.
  const [starter] = useState(() => {
    const players = (assignment?.players ?? []).filter(
      (p) => !state.eliminatedIds.includes(p.id),
    )
    if (players.length === 0) return null
    return players[Math.floor(rng() * players.length)] ?? players[0]
  })

  const [musicOn, setMusicOn] = useState(false)

  useEffect(() => {
    if (musicOn && !muted) {
      try {
        startLoop('calm')
      } catch {
        // background music is best-effort
      }
    } else {
      try {
        stopLoop()
      } catch {
        // ignore
      }
    }
    return () => {
      try {
        stopLoop()
      } catch {
        // ignore
      }
    }
  }, [musicOn, muted, startLoop, stopLoop])

  if (!assignment || !starter) return null

  return (
    <div className="rise-in flex min-h-full flex-1 flex-col gap-8">
      <h1 className="text-center text-xs font-bold uppercase tracking-[0.18em] text-brand-500 dark:text-brand-300">
        {t('round.title')}
      </h1>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <span
          aria-hidden
          className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500/15 to-accent-500/15 text-5xl shadow-sm ring-1 ring-brand-500/20"
        >
          💬
        </span>
        <p className="text-balance text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-50">
          {t('round.startsWith', { name: starter.name })}
        </p>
      </div>

      <label className="flex min-h-11 items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
        <span className="text-base font-medium text-slate-700 dark:text-slate-200">
          {t('round.music')}
        </span>
        <input
          type="checkbox"
          className="h-5 w-5 accent-brand-600"
          checked={musicOn}
          onChange={(e) => setMusicOn(e.target.checked)}
        />
      </label>

      <Button
        size="lg"
        className="w-full"
        onClick={() => dispatch({ type: 'END_ROUND' })}
      >
        {t('round.vote')}
      </Button>
    </div>
  )
}
