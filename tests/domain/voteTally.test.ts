import { describe, expect, it } from 'vitest'
import { addVote, removeVote, totalVotes, voteLeader } from '../../src/domain/game/voteTally'

describe('addVote', () => {
  it('adds one vote without mutating the tally', () => {
    const empty = {}
    const once = addVote(empty, 'a', 3)
    expect(once).toEqual({ a: 1 })
    expect(addVote(once, 'a', 3)).toEqual({ a: 2 })
    expect(empty).toEqual({})
  })

  it('ignores votes beyond the capacity', () => {
    const full = addVote(addVote({}, 'a', 2), 'b', 2)
    expect(addVote(full, 'a', 2)).toBe(full)
  })
})

describe('removeVote', () => {
  it('removes one vote', () => {
    expect(removeVote({ a: 2 }, 'a')).toEqual({ a: 1 })
  })

  it('never goes below zero', () => {
    const tally = { a: 0 }
    expect(removeVote(tally, 'a')).toBe(tally)
    expect(removeVote(tally, 'b')).toBe(tally)
  })
})

describe('totalVotes', () => {
  it('sums every player', () => {
    expect(totalVotes({})).toBe(0)
    expect(totalVotes({ a: 2, b: 1 })).toBe(3)
  })
})

describe('voteLeader', () => {
  it('is none without votes', () => {
    expect(voteLeader({})).toEqual({ kind: 'none' })
    expect(voteLeader({ a: 0 })).toEqual({ kind: 'none' })
  })

  it('names a strict leader', () => {
    expect(voteLeader({ a: 2, b: 1 })).toEqual({ kind: 'leader', playerId: 'a' })
  })

  it('reports every player sharing the top as a tie', () => {
    expect(voteLeader({ a: 1, b: 1, c: 0 })).toEqual({ kind: 'tie', playerIds: ['a', 'b'] })
  })
})
