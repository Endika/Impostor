import { useTranslation } from 'react-i18next'
import { useGame } from '../state/useGame'
import { Button } from '../components/Button'

export function EliminationScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = useGame()

  const { assignment, lastElimination } = state
  if (!assignment || !lastElimination) return null

  const votedName =
    assignment.players.find((p) => p.id === lastElimination.votedPlayerId)
      ?.name ?? lastElimination.votedPlayerId

  // Catching an impostor is good news for the crew (positive tone); voting out
  // an innocent is a setback (warn tone). Never the brand color for semantics.
  const caughtImpostor = lastElimination.votedWasImpostor

  return (
    <div className="flex min-h-full flex-1 flex-col gap-6">
      <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-slate-50">
        {t('elimination.title')}
      </h1>

      <div
        className={`flex flex-col items-center gap-2 rounded-3xl px-4 py-8 text-center text-xl font-extrabold shadow-sm ${
          caughtImpostor
            ? 'bg-emerald-600 text-white'
            : 'bg-amber-500 text-amber-950'
        }`}
      >
        <span aria-hidden className="text-4xl">
          {caughtImpostor ? '✅' : '😬'}
        </span>
        {caughtImpostor
          ? t('elimination.wasImpostor', { name: votedName })
          : t('elimination.wasCrew', { name: votedName })}
      </div>

      <p className="text-center text-lg font-semibold text-slate-700 dark:text-slate-200">
        {t('elimination.remaining', {
          crew: lastElimination.aliveCrewCount,
          impostors: lastElimination.aliveImpostorCount,
        })}
      </p>

      <Button
        size="lg"
        className="mt-auto w-full"
        onClick={() => dispatch({ type: 'NEXT_ROUND' })}
      >
        {t('elimination.nextRound')}
      </Button>
    </div>
  )
}
