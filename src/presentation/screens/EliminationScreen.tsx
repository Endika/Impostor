import { useTranslation } from 'react-i18next'
import { CircleX, UserCheck, UserX } from 'lucide-react'
import { useGame } from '../state/useGame'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ConfirmButton } from '../components/ConfirmButton'

export function EliminationScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = useGame()

  const { assignment, lastElimination } = state
  if (!assignment || !lastElimination) return null

  const votedName =
    assignment.players.find((p) => p.id === lastElimination.votedPlayerId)?.name ??
    lastElimination.votedPlayerId

  // Catching an impostor is good news for the crew (positive); voting out an
  // innocent is a setback (warn); a failed guess is a loss for that player.
  const caughtImpostor = lastElimination.votedWasImpostor
  const isContinue = lastElimination.status === 'continue'
  const fromFailedGuess = lastElimination.fromFailedGuess === true
  // A failed risky guess already used up the impostor's word attempt, so never
  // offer the last-chance guess again here.
  const showGuessButton = caughtImpostor && !fromFailedGuess

  const tone = fromFailedGuess ? 'bg-danger' : caughtImpostor ? 'bg-positive' : 'bg-warn'
  const Icon = fromFailedGuess ? CircleX : caughtImpostor ? UserCheck : UserX
  const verdict = fromFailedGuess
    ? t('elimination.failedGuess', { name: votedName })
    : caughtImpostor
      ? t('elimination.wasImpostor', { name: votedName })
      : t('elimination.wasCrew', { name: votedName })

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-1 flex-col justify-center gap-6">
        <div
          className={`verdict-in flex flex-col items-center gap-4 rounded-3xl px-6 py-10 text-center text-on-color shadow-card ${tone}`}
        >
          <Icon aria-hidden size={56} strokeWidth={2.25} />
          <h1 className="text-[2.6rem] leading-[1.05] font-extrabold tracking-tight text-balance [overflow-wrap:anywhere]">
            {verdict}
          </h1>
        </div>

        <p role="status" className="text-center text-2xl font-bold text-balance">
          {t('elimination.remaining', {
            crew: t('elimination.crewCount', { count: lastElimination.aliveCrewCount }),
            impostors: t('elimination.impostorCount', {
              count: lastElimination.aliveImpostorCount,
            }),
          })}
        </p>
      </div>

      {showGuessButton && (
        <Card className="flex flex-col gap-3 p-5 text-center">
          <p className="text-muted">{t('elimination.guessPrompt')}</p>
          <ConfirmButton
            variant="warn"
            className="w-full"
            onConfirm={() =>
              dispatch({ type: 'IMPOSTOR_GUESSED_RIGHT', playerId: lastElimination.votedPlayerId })
            }
          >
            {t('elimination.guessedRight')}
          </ConfirmButton>
        </Card>
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
