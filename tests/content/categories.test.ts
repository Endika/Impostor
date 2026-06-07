import { describe, expect, it } from 'vitest'
import { categoryData, categoryIds } from '../../src/content/categories'
import type { LocaleCode } from '../../src/domain/game/types'

const expectedIds = ['general', 'music', 'places', 'food', 'animals', 'cinema']
const locales: LocaleCode[] = ['ca', 'en', 'es', 'eu', 'gl', 'va']

describe('bundled categories', () => {
  it('exposes exactly the six expected category ids', () => {
    expect([...categoryIds].sort()).toEqual([...expectedIds].sort())
    expect(Object.keys(categoryData).sort()).toEqual([...expectedIds].sort())
  })

  for (const id of expectedIds) {
    describe(`category "${id}"`, () => {
      it('has all six locales', () => {
        expect(Object.keys(categoryData[id]!).sort()).toEqual(
          [...locales].sort(),
        )
      })

      for (const locale of locales) {
        it(`has at least 30 unique, non-empty words for "${locale}"`, () => {
          const words = categoryData[id]![locale]!
          expect(words.length).toBeGreaterThanOrEqual(30)
          for (const w of words) expect(w.trim().length).toBeGreaterThan(0)
          expect(new Set(words).size).toBe(words.length)
        })
      }
    })
  }

  it('has a grand total of at least 1000 word entries', () => {
    let total = 0
    for (const id of expectedIds)
      for (const locale of locales)
        total += categoryData[id]![locale]!.length
    expect(total).toBeGreaterThanOrEqual(1000)
  })
})
