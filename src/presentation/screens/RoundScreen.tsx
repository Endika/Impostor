import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../state/useGame'
import { useAudio } from '../audio/useAudio'
import type { Rng } from '../../domain/game/types'

interface RoundScreenProps {
  rng?: Rng
}

export function RoundScreen({ rng = Math.random }: RoundScreenProps) {
  const { t } = useTranslation()
  const { state, dispatch } = useGame()
  const { startLoop, stopLoop, muted } = useAudio()

  const assignment = state.assignment

  // Pick the starting player once on mount; tests inject a deterministic rng.
  const [starter] = useState(() => {
    const players = assignment?.players ?? []
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
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 p-4">
      <h1 className="text-center text-2xl font-bold text-slate-100">
        {t('round.title')}
      </h1>

      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="text-3xl font-extrabold text-slate-100">
          {t('round.startsWith', { name: starter.name })}
        </p>
      </div>

      <label className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 px-4 py-3">
        <span className="text-base font-medium text-slate-200">
          {t('round.music')}
        </span>
        <input
          type="checkbox"
          className="h-5 w-5"
          checked={musicOn}
          onChange={(e) => setMusicOn(e.target.checked)}
        />
      </label>

      <button
        type="button"
        className="rounded-xl bg-indigo-500 px-4 py-4 text-lg font-semibold text-white"
        onClick={() => dispatch({ type: 'END_ROUND' })}
      >
        {t('round.vote')}
      </button>
    </div>
  )
}
