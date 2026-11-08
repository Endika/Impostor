import type { LocaleCode } from '../game/types'
import type { CategoryData } from './types'

export function poolWords(data: CategoryData, categoryIds: string[], locale: LocaleCode): string[] {
  const words = categoryIds.flatMap((id) => (data[id]?.[locale] ?? []).map((e) => e.word))
  return [...new Set(words)]
}

/**
 * Records `played` as used. Once that completes the pool, a new cycle starts:
 * the pool's words are released except `played`, so it can't repeat right away.
 * Used words outside the pool are left untouched.
 */
export function nextUsedWords(used: string[], played: string, pool: string[]): string[] {
  const updated = used.includes(played) ? used : [...used, played]
  const exhausted = pool.length > 0 && pool.every((word) => updated.includes(word))
  if (!exhausted) return updated
  const inPool = new Set(pool)
  return [...updated.filter((word) => !inPool.has(word) && word !== played), played]
}
