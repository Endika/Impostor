import { describe, expect, it } from 'vitest'
import { maxImpostorsFor, maxRandomImpostorsFor } from '../../src/domain/game/impostorLimits'

describe('maxImpostorsFor', () => {
  it.each([
    [3, 1],
    [4, 2],
    [5, 2],
    [6, 3],
    [7, 3],
    [10, 5],
  ])('allows %i players at most %i impostors, never more than the crew', (players, max) => {
    expect(maxImpostorsFor(players)).toBe(max)
    expect(max).toBeLessThanOrEqual(players - max)
  })
})

describe('maxRandomImpostorsFor', () => {
  it.each([
    [3, 1],
    [4, 2],
    [6, 4],
    [10, 8],
  ])('leaves two crew with %i players when impostors do not see each other: %i', (players, max) => {
    expect(maxRandomImpostorsFor(players, false)).toBe(max)
  })

  it('keeps at most half the players when impostors see each other', () => {
    expect(maxRandomImpostorsFor(6, true)).toBe(maxImpostorsFor(6))
    expect(maxRandomImpostorsFor(10, true)).toBe(maxImpostorsFor(10))
  })
})
