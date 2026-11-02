import { describe, expect, it } from 'vitest'
import { maxImpostorsFor } from '../../src/domain/game/impostorLimits'

describe('maxImpostorsFor', () => {
  it.each([
    [3, 1],
    [4, 1],
    [5, 2],
    [6, 2],
    [7, 3],
    [10, 4],
  ])('allows %i players at most %i impostors, always fewer than the crew', (players, max) => {
    expect(maxImpostorsFor(players)).toBe(max)
    expect(max).toBeLessThan(players - max)
  })
})
