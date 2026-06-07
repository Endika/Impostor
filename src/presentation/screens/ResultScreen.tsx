import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../state/useGame'
import { useAudio } from '../audio/useAudio'

export function ResultScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = useGame()
  const { play } = useAudio()

  const { assignment, outcome, votedPlayerId } = state

  const crewWon = outcome?.winner === 'crew'

  useEffect(() => {
    if (!outcome) return
    try {
      play(crewWon ? 'victoryCrew' : 'victoryImpostor')
    } catch {
      // audio is best-effort
    }
  }, [outcome, crewWon, play])

  if (!assignment || !outcome) return null

  const nameById = (id: string) =>
    assignment.players.find((p) => p.id === id)?.name ?? id

  const votedName = votedPlayerId ? nameById(votedPlayerId) : ''
  const impostorNames = outcome.impostorIds.map(nameById).join(', ')

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 p-4">
      <div
        className={`rounded-2xl px-4 py-6 text-center text-2xl font-extrabold ${
          crewWon
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-700 text-slate-100'
        }`}
      >
        {crewWon ? t('result.crewWins') : t('result.impostorWins')}
      </div>

      <p className="text-center text-lg font-semibold text-slate-200">
        {outcome.votedWasImpostor
          ? t('result.isImpostor', { name: votedName })
          : t('result.notImpostor', { name: votedName })}
      </p>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-700 bg-slate-800 p-4 text-center">
        <div className="flex flex-col gap-1">
          <span className="text-sm uppercase tracking-wide text-slate-400">
            {t('result.theWordWas')}
          </span>
          <span className="text-2xl font-bold text-slate-100">
            {outcome.word}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm uppercase tracking-wide text-slate-400">
            {t('result.theImpostorsWere')}
          </span>
          <span className="text-xl font-semibold text-slate-100">
            {impostorNames}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="rounded-xl bg-indigo-500 px-4 py-4 text-lg font-semibold text-white"
        onClick={() => dispatch({ type: 'PLAY_AGAIN' })}
      >
        {t('result.playAgain')}
      </button>
    </div>
  )
}
