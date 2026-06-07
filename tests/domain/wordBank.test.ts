import { describe, expect, it } from 'vitest'
import { InMemoryWordBank } from '../../src/domain/content/InMemoryWordBank'
import type { CategoryData } from '../../src/domain/content/types'

const fixture: CategoryData = {
  general: { es: ['Playa', 'Hospital'], en: ['Beach', 'Hospital'] },
  music: { es: ['Rosalía', 'Reggaetón'], en: ['The Beatles', 'Jazz'] },
}

describe('InMemoryWordBank', () => {
  it('returns the first word of a single category with rng=0', () => {
    const bank = new InMemoryWordBank(fixture)
    expect(bank.pick(['general'], 'es', () => 0)).toEqual({
      word: 'Playa',
      categoryId: 'general',
    })
  })

  it('picks from the music category at the end of a combined pool', () => {
    const bank = new InMemoryWordBank(fixture)
    const result = bank.pick(['general', 'music'], 'en', () => 0.99)
    expect(result.categoryId).toBe('music')
  })

  it('throws when no words exist for the locale/categories', () => {
    const bank = new InMemoryWordBank(fixture)
    expect(() => bank.pick(['music'], 'ca', () => 0)).toThrow(
      'no_words_available',
    )
  })
})
