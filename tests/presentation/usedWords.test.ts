import { beforeEach, describe, expect, it } from 'vitest'
import { addUsedWord, loadUsedWords } from '../../src/presentation/state/usedWords'

describe('usedWords storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns an empty list when nothing is stored', () => {
    expect(loadUsedWords('es')).toEqual([])
  })

  it('round-trips added words for a locale', () => {
    addUsedWord('es', 'Playa')
    addUsedWord('es', 'Montaña')
    expect(loadUsedWords('es')).toEqual(['Playa', 'Montaña'])
  })

  it('does not add duplicates', () => {
    addUsedWord('es', 'Playa')
    addUsedWord('es', 'Playa')
    expect(loadUsedWords('es')).toEqual(['Playa'])
  })

  it('keeps locales independent', () => {
    addUsedWord('es', 'Playa')
    addUsedWord('en', 'Beach')
    expect(loadUsedWords('es')).toEqual(['Playa'])
    expect(loadUsedWords('en')).toEqual(['Beach'])
  })
})
