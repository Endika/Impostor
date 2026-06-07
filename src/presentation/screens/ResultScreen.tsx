import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../state/useGame'
import { useAudio } from '../audio/useAudio'
import { Button } from '../components/Button'

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
    <div className="flex min-h-full flex-1 flex-col gap-6">
      <div
        className={`flex flex-col items-center gap-2 rounded-3xl px-4 py-8 text-center text-2xl font-extrabold shadow-sm ${
          crewWon
            ? 'bg-emerald-600 text-white'
            : 'bg-amber-500 text-amber-950'
        }`}
      >
        <span aria-hidden className="text-4xl">
          {crewWon ? '🎉' : '🕵️'}
        </span>
        {crewWon ? t('result.crewWins') : t('result.impostorWins')}
      </div>

      <p className="text-center text-lg font-semibold text-slate-700 dark:text-slate-200">
        {outcome.votedWasImpostor
          ? t('result.isImpostor', { name: votedName })
          : t('result.notImpostor', { name: votedName })}
      </p>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-center dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-1">
          <span className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t('result.theWordWas')}
          </span>
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {outcome.word}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t('result.theImpostorsWere')}
          </span>
          <span className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {impostorNames}
          </span>
        </div>
      </div>

      <Button
        size="lg"
        className="mt-auto w-full"
        onClick={() => dispatch({ type: 'PLAY_AGAIN' })}
      >
        {t('result.playAgain')}
      </Button>
    </div>
  )
}
