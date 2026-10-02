import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../state/useGame'
import { useAudio } from '../audio/useAudio'
import { Button } from '../components/Button'
import { PlayerRow } from '../components/PlayerRow'

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
    <div className="flex flex-1 flex-col gap-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-balance">{t('vote.title')}</h1>

      <div role="radiogroup" aria-label={t('vote.title')} className="flex flex-1 flex-col gap-2.5">
        {alivePlayers.map((player) => (
          <PlayerRow
            key={player.id}
            name={player.name}
            selected={player.id === selectedId}
            onClick={() => setSelectedId(player.id)}
          />
        ))}
      </div>

      <Button size="lg" className="w-full" disabled={!selectedId} onClick={confirm}>
        {t('vote.confirm')}
      </Button>
    </div>
  )
}
