import { describe, expect, it } from 'vitest'
import { InMemoryWordBank } from '../../src/domain/content/InMemoryWordBank'
import type { CategoryData } from '../../src/domain/content/types'

const fixture: CategoryData = {
  home: {
    es: [
      { word: 'Reloj', hints: ['Tiempo', 'Muñeca'] },
      { word: 'Silla', hints: ['Sentarse', 'Mesa'] },
    ],
    en: [
      { word: 'Clock', hints: ['Time', 'Wall'] },
      { word: 'Chair', hints: ['Sit', 'Table'] },
    ],
  },
  music: {
    es: [
      { word: 'Rosalía', hints: ['Cantante', 'Flamenco'] },
      { word: 'Reggaetón', hints: ['Género', 'Baile'] },
    ],
    en: [
      { word: 'Drums', hints: ['Percussion', 'Sticks'] },
      { word: 'Jazz', hints: ['Genre', 'Improv'] },
    ],
  },
}

describe('InMemoryWordBank', () => {
  it('returns the first word and its hints with rng=0', () => {
    const bank = new InMemoryWordBank(fixture)
    expect(bank.pick(['home'], 'es', () => 0)).toEqual({
      word: 'Reloj',
      categoryId: 'home',
      hints: ['Tiempo', 'Muñeca'],
    })
  })

  it('picks from the music category at the end of a combined pool', () => {
    const bank = new InMemoryWordBank(fixture)
    const result = bank.pick(['home', 'music'], 'en', () => 0.99)
    expect(result.categoryId).toBe('music')
    expect(result).toEqual({
      word: 'Jazz',
      categoryId: 'music',
      hints: ['Genre', 'Improv'],
    })
  })

  it('throws when no words exist for the locale/categories', () => {
    const bank = new InMemoryWordBank(fixture)
    expect(() => bank.pick(['music'], 'ca', () => 0)).toThrow('no_words_available')
  })

  it('falls back to the full pool when every word is excluded', () => {
    const single: CategoryData = {
      home: { es: [{ word: 'Playa', hints: ['Costa', 'Arena'] }] },
    }
    const bank = new InMemoryWordBank(single)
    // 'Playa' is the only candidate and it is excluded: rather than throwing,
    // the bank resets and returns it again.
    expect(bank.pick(['home'], 'es', () => 0, ['Playa'])).toEqual({
      word: 'Playa',
      categoryId: 'home',
      hints: ['Costa', 'Arena'],
    })
  })

  it('never returns an excluded word when alternatives exist', () => {
    const two: CategoryData = {
      home: {
        es: [
          { word: 'A', hints: ['a-hint', 'a-hint-2'] },
          { word: 'B', hints: ['b-hint', 'b-hint-2'] },
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
