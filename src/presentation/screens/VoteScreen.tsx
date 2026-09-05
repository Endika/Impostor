import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../state/useGame'
import { useAudio } from '../audio/useAudio'
import { Button } from '../components/Button'

export function VoteScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = useGame()
  const { play } = useAudio()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const assignment = state.assignment
  if (!assignment) return null

  const alivePlayers = assignment.players.filter((p) => !state.eliminatedIds.includes(p.id))

  function confirm() {
    if (!selectedId) return
    try {
      play('vote')
    } catch {
      // audio is best-effort
    }
    dispatch({ type: 'CAST_VOTE', votedPlayerId: selectedId })
  }

  return (
    <div className="rise-in flex min-h-full flex-1 flex-col gap-6">
      <h1 className="text-center text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
        {t('vote.title')}
      </h1>

      <div className="flex flex-1 flex-col gap-3">
        {alivePlayers.map((player) => {
          const isSelected = player.id === selectedId
          return (
            <button
              key={player.id}
              type="button"
              aria-pressed={isSelected}
              className={`flex min-h-13 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-lg font-bold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950 ${
                isSelected
                  ? 'border-transparent bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-600/25'
                  : 'border-slate-200/80 bg-white/80 text-slate-800 shadow-sm backdrop-blur-sm hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-800/70'
              }`}
              onClick={() => setSelectedId(player.id)}
            >
              <span className="min-w-0 break-words">{player.name}</span>
              <span
                aria-hidden
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm transition ${
                  isSelected
                    ? 'bg-white/25 text-white'
                    : 'border border-slate-300 text-transparent dark:border-slate-600'
                }`}
              >
                ✓
              </span>
            </button>
          )
        })}
      </div>

      <Button size="lg" className="w-full" disabled={!selectedId} onClick={confirm}>
        {t('vote.confirm')}
      </Button>
    </div>
  )
}
