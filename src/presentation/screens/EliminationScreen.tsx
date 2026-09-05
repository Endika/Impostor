import { useTranslation } from 'react-i18next'
import { useGame } from '../state/useGame'
import { Button } from '../components/Button'

export function EliminationScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = useGame()

  const { assignment, lastElimination } = state
  if (!assignment || !lastElimination) return null

  const votedName =
    assignment.players.find((p) => p.id === lastElimination.votedPlayerId)?.name ??
    lastElimination.votedPlayerId

  // Catching an impostor is good news for the crew (positive tone); voting out
  // an innocent is a setback (warn tone). Never the brand color for semantics.
  const caughtImpostor = lastElimination.votedWasImpostor
  const isContinue = lastElimination.status === 'continue'
  const fromFailedGuess = lastElimination.fromFailedGuess === true
  // A failed risky guess already used up the impostor's word attempt, so never
  // offer the last-chance guess again here.
  const showGuessButton = caughtImpostor && !fromFailedGuess

  return (
    <div className="rise-in flex min-h-full flex-1 flex-col gap-6">
      <h1 className="text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {t('elimination.title')}
      </h1>

      <div
        className={`flex flex-col items-center gap-3 rounded-3xl px-5 py-10 text-center text-xl font-extrabold shadow-lg ${
          fromFailedGuess
            ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-600/30'
            : caughtImpostor
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-600/30'
              : 'bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950 shadow-amber-500/30'
        }`}
      >
        <span aria-hidden className="text-5xl drop-shadow-sm">
          {fromFailedGuess ? '❌' : caughtImpostor ? '✅' : '😬'}
        </span>
        <span className="text-balance">
          {fromFailedGuess
            ? t('elimination.failedGuess', { name: votedName })
            : caughtImpostor
              ? t('elimination.wasImpostor', { name: votedName })
              : t('elimination.wasCrew', { name: votedName })}
        </span>
      </div>

      <p className="text-center text-lg font-semibold text-slate-700 dark:text-slate-200">
        {t('elimination.remaining', {
          crew: lastElimination.aliveCrewCount,
          impostors: lastElimination.aliveImpostorCount,
        })}
      </p>

      {showGuessButton && (
        <section className="flex flex-col gap-3 rounded-2xl border border-amber-300/70 bg-amber-50/80 px-4 py-4 text-center shadow-sm backdrop-blur-sm dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            {t('elimination.guessPrompt')}
          </p>
          <Button
            variant="secondary"
            className="w-full border-amber-400 bg-amber-400 text-amber-950 hover:bg-amber-300 dark:border-amber-500/50 dark:bg-amber-500/30 dark:text-amber-100"
            onClick={() => dispatch({ type: 'IMPOSTOR_GUESSED_RIGHT' })}
          >
            {t('elimination.guessedRight')}
          </Button>
        </section>
      )}

      {isContinue ? (
        <Button
          size="lg"
          className="mt-auto w-full"
          onClick={() => dispatch({ type: 'NEXT_ROUND' })}
        >
          {t('elimination.nextRound')}
        </Button>
      ) : (
        <Button
          size="lg"
          className="mt-auto w-full"
          onClick={() => dispatch({ type: 'SHOW_RESULT' })}
        >
          {t('elimination.seeResult')}
        </Button>
      )}
    </div>
  )
}
