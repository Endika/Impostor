import type { LocaleCode, Rng } from '../game/types'
import type { CategoryData, WordBank } from './types'

export class InMemoryWordBank implements WordBank {
  constructor(private readonly data: CategoryData) {}

  pick(
    categoryIds: string[],
    locale: LocaleCode,
    rng: Rng,
    excludeWords: string[] = [],
  ) {
    const pool: { word: string; categoryId: string; hint: string }[] = []
    for (const id of categoryIds)
      for (const entry of this.data[id]?.[locale] ?? [])
        pool.push({ word: entry.word, categoryId: id, hint: entry.hint })
    if (pool.length === 0) throw new Error('no_words_available')
    const excluded = new Set(excludeWords)
    const filtered = pool.filter((entry) => !excluded.has(entry.word))
    // Auto-reset: when every word has been used, fall back to the full pool
    // so the game never breaks once the available words are exhausted.
    const candidates = filtered.length > 0 ? filtered : pool
    return candidates[Math.floor(rng() * candidates.length)]!
  }
}
