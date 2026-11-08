import type { Rng } from './types'

const MAX_STREAK = 10

export function streakOf(streaks: Record<string, number>, name: string): number {
  const value = Object.hasOwn(streaks, name) ? streaks[name] : 0
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : 0
}

export function impostorWeight(streak: number): number {
  return 2 ** -Math.min(Math.max(streak, 0), MAX_STREAK)
}

export function drawImpostorIndices(
  names: string[],
  k: number,
  streaks: Record<string, number>,
  rng: Rng,
): number[] {
  const remaining = names.map((name, index) => ({
    index,
    weight: impostorWeight(streakOf(streaks, name.trim())),
  }))
  const drawn: number[] = []
  const count = Math.min(k, remaining.length)
  for (let n = 0; n < count; n++) {
    const total = remaining.reduce((sum, c) => sum + c.weight, 0)
    const target = rng() * total
    let acc = 0
    let pick = remaining.length - 1
    for (let i = 0; i < remaining.length; i++) {
      acc += remaining[i]!.weight
      if (target < acc) {
        pick = i
        break
      }
    }
    drawn.push(remaining[pick]!.index)
    remaining.splice(pick, 1)
  }
  return drawn
}

export function nextStreaks(
  prev: Record<string, number>,
  players: { name: string; isImpostor: boolean }[],
): Record<string, number> {
  const next: Record<string, number> = { ...prev }
  for (const p of players) {
    const name = p.name.trim()
    next[name] = p.isImpostor ? streakOf(prev, name) + 1 : 0
  }
  return next
}
