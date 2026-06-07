import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../state/useGame'
import { useAudio } from '../audio/useAudio'

export function VoteScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = useGame()
  const { play } = useAudio()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const assignment = state.assignment
  if (!assignment) return null

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
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 p-4">
      <h1 className="text-center text-2xl font-bold text-slate-100">
        {t('vote.title')}
      </h1>

      <div className="flex flex-1 flex-col gap-3">
        {assignment.players.map((player) => {
          const isSelected = player.id === selectedId
          return (
            <button
              key={player.id}
              type="button"
              aria-pressed={isSelected}
              className={`rounded-xl border px-4 py-3 text-lg font-semibold ${
                isSelected
                  ? 'border-indigo-400 bg-indigo-500 text-white'
                  : 'border-slate-700 bg-slate-800 text-slate-100'
              }`}
              onClick={() => setSelectedId(player.id)}
            >
              {player.name}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        disabled={!selectedId}
        className="rounded-xl bg-indigo-500 px-4 py-4 text-lg font-semibold text-white disabled:opacity-40"
        onClick={confirm}
      >
        {t('vote.confirm')}
      </button>
    </div>
  )
}
