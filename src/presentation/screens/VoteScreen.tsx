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

  const alivePlayers = assignment.players.filter(
    (p) => !state.eliminatedIds.includes(p.id),
  )

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
    <div className="flex min-h-full flex-1 flex-col gap-6">
      <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-slate-50">
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
              className={`min-h-12 rounded-xl border px-4 py-3 text-lg font-semibold transition active:scale-[0.99] ${
                isSelected
                  ? 'border-brand-500 bg-brand-600 text-white shadow-sm'
                  : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
              }`}
              onClick={() => setSelectedId(player.id)}
            >
              {player.name}
            </button>
          )
        })}
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={!selectedId}
        onClick={confirm}
      >
        {t('vote.confirm')}
      </Button>
    </div>
  )
}
