import { describe, expect, it } from 'vitest'
import { InMemoryWordBank } from '../../src/domain/content/InMemoryWordBank'
import type { CategoryData } from '../../src/domain/content/types'

const fixture: CategoryData = {
  home: {
    es: [
      { word: 'Reloj', hint: 'Tiempo' },
      { word: 'Silla', hint: 'Sentarse' },
    ],
    en: [
      { word: 'Clock', hint: 'Time' },
      { word: 'Chair', hint: 'Sit' },
    ],
  },
  music: {
    es: [
      { word: 'Rosalía', hint: 'Cantante' },
      { word: 'Reggaetón', hint: 'Género' },
    ],
    en: [
      { word: 'Drums', hint: 'Percussion' },
      { word: 'Jazz', hint: 'Genre' },
    ],
  },
}

describe('InMemoryWordBank', () => {
  it('returns the first word of a single category with rng=0', () => {
    const bank = new InMemoryWordBank(fixture)
    expect(bank.pick(['home'], 'es', () => 0)).toEqual({
      word: 'Reloj',
      categoryId: 'home',
      hint: 'Tiempo',
    })
  })

  it('picks from the music category at the end of a combined pool', () => {
    const bank = new InMemoryWordBank(fixture)
    const result = bank.pick(['home', 'music'], 'en', () => 0.99)
    expect(result.categoryId).toBe('music')
    expect(result).toEqual({
      word: 'Jazz',
      categoryId: 'music',
      hint: 'Genre',
    })
  })

  it('throws when no words exist for the locale/categories', () => {
    const bank = new InMemoryWordBank(fixture)
    expect(() => bank.pick(['music'], 'ca', () => 0)).toThrow(
      'no_words_available',
    )
  })

  it('falls back to the full pool when every word is excluded', () => {
    const single: CategoryData = {
      home: { es: [{ word: 'Playa', hint: 'Costa' }] },
    }
    const bank = new InMemoryWordBank(single)
    // 'Playa' is the only candidate and it is excluded: rather than throwing,
    // the bank resets and returns it again.
    expect(bank.pick(['home'], 'es', () => 0, ['Playa'])).toEqual({
      word: 'Playa',
      categoryId: 'home',
      hint: 'Costa',
    })
  })

  it('never returns an excluded word when alternatives exist', () => {
    const two: CategoryData = {
      home: {
        es: [
          { word: 'A', hint: 'a-hint' },
          { word: 'B', hint: 'b-hint' },
        ],
      },
    }
    const bank = new InMemoryWordBank(two)
    // Span the whole rng range; with 'A' excluded only 'B' should ever appear.
    for (const r of [0, 0.25, 0.5, 0.75, 0.99]) {
      expect(bank.pick(['home'], 'es', () => r, ['A']).word).toBe('B')
    }
  })
})
