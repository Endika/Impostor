import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { useGame } from '../state/useGame'
import { Button } from '../components/Button'
import { ConfirmButton } from '../components/ConfirmButton'
import { PlayerRow } from '../components/PlayerRow'

export function GuessScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = useGame()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const assignment = state.assignment
  if (!assignment) return null

  const alivePlayers = assignment.players.filter((p) => !state.eliminatedIds.includes(p.id))
  const selectedName = alivePlayers.find((p) => p.id === selectedId)?.name

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">{t('guess.title')}</h1>
        {!selectedId && <p className="text-lg text-muted">{t('guess.who')}</p>}
      </div>

      {!selectedId ? (
        <div className="flex flex-1 flex-col gap-2.5">
          {alivePlayers.map((player) => (
            <PlayerRow
              key={player.id}
              name={player.name}
              onClick={() => setSelectedId(player.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3">
          <p className="flex flex-1 items-center justify-center text-center text-4xl leading-tight font-extrabold text-balance [overflow-wrap:anywhere]">
            {t('guess.promptNamed', { name: selectedName })}
          </p>
          <ConfirmButton
            variant="positive"
            size="lg"
            className="w-full"
            onConfirm={() => dispatch({ type: 'IMPOSTOR_GUESSED_RIGHT', playerId: selectedId })}
          >
            {t('guess.correct')}
          </ConfirmButton>
          <ConfirmButton
            variant="danger"
            size="lg"
            className="w-full"
            onConfirm={() => dispatch({ type: 'GUESS_FAILED', playerId: selectedId })}
          >
            {t('guess.wrong')}
          </ConfirmButton>
        </div>
      )}

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => (selectedId ? setSelectedId(null) : dispatch({ type: 'CANCEL_GUESS' }))}
      >
        <ArrowLeft aria-hidden size={20} strokeWidth={2.5} />
        {t('guess.cancel')}
      </Button>
    </div>
  )
}
