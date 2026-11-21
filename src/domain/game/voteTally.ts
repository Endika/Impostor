export type VoteTally = Readonly<Record<string, number>>

export type VoteLeader =
  { kind: 'none' } | { kind: 'leader'; playerId: string } | { kind: 'tie'; playerIds: string[] }

export function totalVotes(tally: VoteTally): number {
  return Object.values(tally).reduce((sum, votes) => sum + votes, 0)
}

export function addVote(tally: VoteTally, playerId: string, capacity: number): VoteTally {
  if (totalVotes(tally) >= capacity) return tally
  return { ...tally, [playerId]: (tally[playerId] ?? 0) + 1 }
}

export function removeVote(tally: VoteTally, playerId: string): VoteTally {
  const votes = tally[playerId] ?? 0
  if (votes <= 0) return tally
  return { ...tally, [playerId]: votes - 1 }
}

export function voteLeader(tally: VoteTally): VoteLeader {
  const top = Math.max(0, ...Object.values(tally))
  if (top === 0) return { kind: 'none' }
  const playerIds = Object.keys(tally).filter((id) => tally[id] === top)
  const [first] = playerIds
  return playerIds.length === 1 && first !== undefined
    ? { kind: 'leader', playerId: first }
    : { kind: 'tie', playerIds }
}
