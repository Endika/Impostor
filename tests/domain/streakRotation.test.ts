import { describe, expect, it } from 'vitest'
import { drawByStreaks, streakWeight, nextStreaks } from '../../src/domain/game/streakRotation'
import { mulberry32 } from '../helpers/mulberry32'

const names = ['Ana', 'Ben', 'Cleo', 'Dan', 'Eva']

describe('streakWeight', () => {
  it('halves the weight per consecutive game and floors at 1/1024', () => {
    expect(streakWeight(0)).toBe(1)
    expect(streakWeight(1)).toBe(0.5)
    expect(streakWeight(2)).toBe(0.25)
    expect(streakWeight(10)).toBe(1 / 1024)
    expect(streakWeight(1_000_000)).toBe(1 / 1024)
  })
})

describe('drawByStreaks', () => {
  it('makes a player who was impostor last game about half as likely', () => {
    const rng = mulberry32(42)
    const draws = 20_000
    const counts = [0, 0, 0, 0, 0]
    for (let n = 0; n < draws; n++) {
      counts[drawByStreaks(names, 1, { Ana: 1 }, rng)[0]!]!++
    }
    expect(Math.abs(counts[0]! / draws - 1 / 9)).toBeLessThan(0.015)
    for (let i = 1; i < 5; i++) {
      expect(Math.abs(counts[i]! / draws - 2 / 9)).toBeLessThan(0.015)
    }
  })

  it('weights r=2 at a quarter', () => {
    const rng = mulberry32(7)
    const draws = 20_000
    let ana = 0
    for (let n = 0; n < draws; n++) {
      if (drawByStreaks(names, 1, { Ana: 2 }, rng)[0] === 0) ana++
    }
    expect(Math.abs(ana / draws - 0.25 / 4.25)).toBeLessThan(0.015)
  })

  it('treats names without history as r=0 and matches by trimmed name', () => {
    const rng = mulberry32(3)
    let ana = 0
    for (let n = 0; n < 20_000; n++) {
      if (drawByStreaks([' Ana ', 'Ben'], 1, { Ana: 1 }, rng)[0] === 0) ana++
    }
    expect(Math.abs(ana / 20_000 - 1 / 3)).toBeLessThan(0.015)
  })

  it('returns exactly k distinct indices', () => {
    const rng = mulberry32(1)
    for (let n = 0; n < 500; n++) {
      const k = 1 + (n % 4)
      const drawn = drawByStreaks(names, k, { Ana: 3, Ben: 1 }, rng)
      expect(drawn).toHaveLength(k)
      expect(new Set(drawn).size).toBe(k)
    }
  })

  it('ignores invalid stored streaks', () => {
    const rng = mulberry32(5)
    const drawn = drawByStreaks(names, 2, { Ana: -3, Ben: 1.5, Cleo: NaN }, rng)
    expect(drawn).toHaveLength(2)
  })

  it('still draws k with an absurd streak and with an inherited key name', () => {
    const rng = mulberry32(9)
    const drawn = drawByStreaks(['Ana', 'constructor'], 2, { Ana: 1_000_000 }, rng)
    expect([...drawn].sort()).toEqual([0, 1])
  })

  it('survives 10 000 chained rematches with valid weights', () => {
    const rng = mulberry32(2026)
    let streaks: Record<string, number> = { Ana: 1_000_000 }
    for (let n = 0; n < 10_000; n++) {
      const k = 1 + (n % 2)
      const drawn = drawByStreaks(names, k, streaks, rng)
      expect(drawn).toHaveLength(k)
      expect(new Set(drawn).size).toBe(k)
      for (const name of names) {
        const w = streakWeight(streaks[name] ?? 0)
        expect(w).toBeGreaterThan(0)
        expect(Number.isFinite(w)).toBe(true)
      }
      streaks = nextStreaks(
        streaks,
        names.map((name, i) => ({ name, hit: drawn.includes(i) })),
      )
    }
  })
})

describe('nextStreaks', () => {
  it('adds one to impostors, resets crew and keeps absent players', () => {
    const next = nextStreaks({ Ana: 2, Ben: 3, Zoe: 4 }, [
      { name: 'Ana', hit: true },
      { name: 'Ben', hit: false },
      { name: 'Cleo', hit: true },
    ])
    expect(next).toEqual({ Ana: 3, Ben: 0, Cleo: 1, Zoe: 4 })
  })
})

describe('opener draw', () => {
  it('makes a player who opened last round about half as likely among 5', () => {
    const rng = mulberry32(7)
    const draws = 20_000
    let hits = 0
    for (let n = 0; n < draws; n++) {
      if (drawByStreaks(names, 1, { Ana: 1 }, rng)[0] === 0) hits++
    }
    expect(Math.abs(hits / draws - 1 / 9)).toBeLessThan(0.015)
  })

  it('is role-blind: swapping the impostor does not change the opener', () => {
    const streaks = { Ben: 2, Cleo: 1 }
    const players = (impostor: string) =>
      names.map((name) => ({ name, isImpostor: name === impostor }))
    const openers = (impostor: string) => {
      const rng = mulberry32(99)
      return Array.from({ length: 200 }, () => {
        const alive = players(impostor)
        return drawByStreaks(
          alive.map((p) => p.name),
          1,
          streaks,
          rng,
        )[0]
      })
    }
    expect(openers('Ana')).toEqual(openers('Eva'))
  })
})
