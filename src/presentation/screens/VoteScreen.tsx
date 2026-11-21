import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../state/useGame'
import { useAudio } from '../audio/useAudio'
import { Button } from '../components/Button'
import { VoteRow } from '../components/VoteRow'
import {
  addVote,
  removeVote,
  totalVotes,
  voteLeader,
  type VoteTally,
} from '../../domain/game/voteTally'

export function VoteScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = useGame()
  const { play } = useAudio()
  const [tally, setTally] = useState<VoteTally>({})

  const assignment = state.assignment
  if (!assignment) return null

  const alivePlayers = assignment.players.filter((p) => !state.eliminatedIds.includes(p.id))
  const capacity = alivePlayers.length
  const total = totalVotes(tally)
  const leader = voteLeader(tally)
  const leaderName =
    leader.kind === 'leader' ? alivePlayers.find((p) => p.id === leader.playerId)?.name : undefined

  function confirm() {
    if (leader.kind === 'leader') {
      try {
        play('vote')
      } catch {
        // audio is best-effort
      }
      dispatch({ type: 'CAST_VOTE', votedPlayerId: leader.playerId })
    } else if (leader.kind === 'tie') {
      dispatch({ type: 'VOTE_TIED' })
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-balance">{t('vote.title')}</h1>
        <p className="text-base text-muted">{t('vote.hint')}</p>
        <p role="status" className="text-lg font-bold">
          {t('vote.counter', { votes: total, total: capacity })}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-2.5">
        {alivePlayers.map((player) => (
          <VoteRow
            key={player.id}
            name={player.name}
            votes={tally[player.id] ?? 0}
            canAdd={total < capacity}
            onAdd={() => setTally((current) => addVote(current, player.id, capacity))}
            onRemove={() => setTally((current) => removeVote(current, player.id))}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <Button size="lg" className="w-full" disabled={leader.kind === 'none'} onClick={confirm}>
          {leader.kind === 'tie' ? t('vote.tie') : t('vote.eliminate', { name: leaderName ?? '' })}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => dispatch({ type: 'CANCEL_VOTE' })}
        >
          {t('vote.cancel')}
        </Button>
      </div>
    </div>
  )
}
