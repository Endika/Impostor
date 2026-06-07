import { describe, expect, it } from 'vitest'
import { categoryData, categoryIds } from '../../src/content/categories'
import type { LocaleCode } from '../../src/domain/game/types'

const expectedIds = ['general', 'music', 'places']
const locales: LocaleCode[] = ['ca', 'en', 'es', 'eu', 'gl', 'va']

describe('bundled categories', () => {
  it('exposes exactly the three expected category ids', () => {
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
        it(`has at least 15 unique, non-empty words for "${locale}"`, () => {
          const words = categoryData[id]![locale]!
          expect(words.length).toBeGreaterThanOrEqual(15)
          for (const w of words) expect(w.trim().length).toBeGreaterThan(0)
          expect(new Set(words).size).toBe(words.length)
        })
      }
    })
  }
})
