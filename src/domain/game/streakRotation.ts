import type { Rng } from './types'

const MAX_STREAK = 10

export function streakOf(streaks: Record<string, number>, name: string): number {
  const value = Object.hasOwn(streaks, name) ? streaks[name] : 0
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : 0
}

export function streakWeight(streak: number): number {
  return 2 ** -Math.min(Math.max(streak, 0), MAX_STREAK)
}

interface Candidate {
  index: number
  weight: number
}

function candidatesFor(names: string[], streaks: Record<string, number>): Candidate[] {
  return names.map((name, index) => ({
    index,
    weight: streakWeight(streakOf(streaks, name.trim())),
  }))
}

function pickPosition(candidates: Candidate[], rng: Rng): number {
  const total = candidates.reduce((sum, c) => sum + c.weight, 0)
  const target = rng() * total
  let acc = 0
  for (let i = 0; i < candidates.length; i++) {
    acc += candidates[i]!.weight
    if (target < acc) return i
  }
  return candidates.length - 1
}

export function drawByStreaks(
  names: string[],
  k: number,
  streaks: Record<string, number>,
  rng: Rng,
): number[] {
  const remaining = candidatesFor(names, streaks)
  const drawn: number[] = []
  const count = Math.min(k, remaining.length)
  for (let n = 0; n < count; n++) {
    const [picked] = remaining.splice(pickPosition(remaining, rng), 1)
    drawn.push(picked!.index)
  }
  return drawn
}

export function nextStreaks(
  prev: Record<string, number>,
  players: { name: string; hit: boolean }[],
): Record<string, number> {
  const next: Record<string, number> = { ...prev }
  for (const p of players) {
    const name = p.name.trim()
    next[name] = p.hit ? streakOf(prev, name) + 1 : 0
  }
  return next
}
