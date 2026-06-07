import { describe, expect, it } from 'vitest'
import { categoryData, categoryIds } from '../../src/content/categories'
import type { LocaleCode } from '../../src/domain/game/types'

const expectedIds = [
  'home',
  'food',
  'animals',
  'music',
  'places',
  'cinema',
  'nature',
  'transport',
]
const locales: LocaleCode[] = ['ca', 'en', 'es', 'eu', 'gl', 'va']

describe('bundled categories', () => {
  it('exposes exactly the eight expected category ids', () => {
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
        it(`has at least 28 valid, unique entries for "${locale}"`, () => {
          const entries = categoryData[id]![locale]!
          expect(entries.length).toBeGreaterThanOrEqual(28)

          const seen = new Set<string>()
          for (const { word, hint } of entries) {
            expect(word.trim().length).toBeGreaterThan(0)
            expect(hint.trim().length).toBeGreaterThan(0)
            expect(hint).not.toBe(word)

            // The hint must not give the word away (case-insensitive substring,
            // both directions).
            const lowerWord = word.toLowerCase()
            const lowerHint = hint.toLowerCase()
            expect(lowerHint.includes(lowerWord)).toBe(false)
            expect(lowerWord.includes(lowerHint)).toBe(false)

            // No duplicate words within a (category, locale).
            expect(seen.has(word)).toBe(false)
            seen.add(word)
          }
        })
      }
    })
  }

  it('has a grand total of at least 1000 entries', () => {
    let total = 0
    let min = Infinity
    for (const id of expectedIds)
      for (const locale of locales) {
        const count = categoryData[id]![locale]!.length
        total += count
        min = Math.min(min, count)
      }
    // eslint-disable-next-line no-console
    console.log(
      `[categories] grand total entries: ${total}; min per (category,locale): ${min}`,
    )
    expect(total).toBeGreaterThanOrEqual(1000)
  })
})
