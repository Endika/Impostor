import { beforeEach, describe, expect, it } from 'vitest'
import { addUsedWord, loadUsedWords } from '../../src/presentation/state/usedWords'

const pool = ['Playa', 'Montaña', 'Beach', 'Lago']

describe('usedWords storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns an empty list when nothing is stored', () => {
    expect(loadUsedWords('es')).toEqual([])
  })

  it('round-trips added words for a locale', () => {
    addUsedWord('es', 'Playa', pool)
    addUsedWord('es', 'Montaña', pool)
    expect(loadUsedWords('es')).toEqual(['Playa', 'Montaña'])
  })

  it('does not add duplicates', () => {
    addUsedWord('es', 'Playa', pool)
    addUsedWord('es', 'Playa', pool)
    expect(loadUsedWords('es')).toEqual(['Playa'])
  })

  it('keeps locales independent', () => {
    addUsedWord('es', 'Playa', pool)
    addUsedWord('en', 'Beach', pool)
    expect(loadUsedWords('es')).toEqual(['Playa'])
    expect(loadUsedWords('en')).toEqual(['Beach'])
  })
})
