import type { LocaleCode, Rng } from '../game/types'
import type { CategoryData, WordBank } from './types'

export class InMemoryWordBank implements WordBank {
  constructor(private readonly data: CategoryData) {}

  pick(categoryIds: string[], locale: LocaleCode, rng: Rng) {
    const pool: { word: string; categoryId: string }[] = []
    for (const id of categoryIds)
      for (const w of this.data[id]?.[locale] ?? [])
        pool.push({ word: w, categoryId: id })
    if (pool.length === 0) throw new Error('no_words_available')
    return pool[Math.floor(rng() * pool.length)]!
  }
}
