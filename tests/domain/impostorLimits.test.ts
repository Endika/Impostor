import { describe, expect, it } from 'vitest'
import { maxImpostorsFor } from '../../src/domain/game/impostorLimits'

describe('maxImpostorsFor', () => {
  describe('when impostors do not see each other (leave two crew)', () => {
    it.each([
      [3, 1],
      [4, 2],
      [5, 3],
      [6, 4],
      [8, 6],
      [10, 8],
    ])('allows %i players at most %i impostors', (players, max) => {
      expect(maxImpostorsFor(players, false)).toBe(max)
      expect(max).toBeLessThanOrEqual(players - 2)
    })
  })

  describe('when impostors see each other (at most half, rounded down)', () => {
    it.each([
      [3, 1],
      [4, 2],
      [5, 2],
      [6, 3],
      [7, 3],
      [10, 5],
    ])('allows %i players at most %i impostors', (players, max) => {
      expect(maxImpostorsFor(players, true)).toBe(max)
      expect(max).toBeLessThanOrEqual(Math.floor(players / 2))
    })
  })
})
