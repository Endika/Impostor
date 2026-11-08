import { describe, expect, it } from 'vitest'
import { InMemoryWordBank } from '../../src/domain/content/InMemoryWordBank'
import type { CategoryData } from '../../src/domain/content/types'
import { nextUsedWords, poolWords } from '../../src/domain/content/usedWordCycle'
import { addUsedWord, loadUsedWords } from '../../src/presentation/state/usedWords'

const entry = (word: string) => ({ word, hints: ['h'] })
const data: CategoryData = {
  a: { es: [entry('A1'), entry('A2'), entry('A3')] },
  b: { es: [entry('B1'), entry('B2')], en: [entry('Bee')] },
}

describe('poolWords', () => {
  it('collects the words of the selected categories for the locale', () => {
    expect(poolWords(data, ['a', 'b'], 'es')).toEqual(['A1', 'A2', 'A3', 'B1', 'B2'])
    expect(poolWords(data, ['b'], 'en')).toEqual(['Bee'])
    expect(poolWords(data, ['missing'], 'es')).toEqual([])
  })
})

describe('nextUsedWords', () => {
  const pool = ['A1', 'A2', 'A3']

  it('appends the played word while the pool is not exhausted', () => {
    expect(nextUsedWords(['A1'], 'A2', pool)).toEqual(['A1', 'A2'])
  })

  it('does not duplicate an already used word', () => {
    expect(nextUsedWords(['A1'], 'A1', pool)).toEqual(['A1'])
  })

  it('keeps only the played word of the pool once the pool is complete', () => {
    expect(nextUsedWords(['A1', 'A2'], 'A3', pool)).toEqual(['A3'])
  })

  it('keeps used words outside the pool', () => {
    expect(nextUsedWords(['B1', 'A1', 'A2'], 'A3', pool)).toEqual(['B1', 'A3'])
  })

  it('ignores an empty pool', () => {
    expect(nextUsedWords(['A1'], 'A2', [])).toEqual(['A1', 'A2'])
  })
})

describe('word cycle with storage and word bank', () => {
  it('restarts no-repeat after exhaustion without repeating the last word', () => {
    window.localStorage.clear()
    const bank = new InMemoryWordBank(data)
    const pool = poolWords(data, ['a'], 'es')
    const rng = () => 0
    const play = () => {
      const { word } = bank.pick(['a'], 'es', rng, loadUsedWords('es'))
      addUsedWord('es', word, pool)
      return word
    }

    const firstCycle = [play(), play(), play()]
    expect(new Set(firstCycle).size).toBe(3)

    const last = firstCycle[2]
    expect(loadUsedWords('es')).toEqual([last])

    const secondRun = [play(), play()]
    expect(secondRun).not.toContain(last)
    expect(new Set(secondRun).size).toBe(2)

    const afterReset = play()
    expect(afterReset).not.toBe(secondRun[1])
  })

  it('leaves used words of unselected categories untouched', () => {
    window.localStorage.clear()
    addUsedWord('es', 'B1', ['A1'])
    addUsedWord('es', 'A1', ['A1'])
    expect(loadUsedWords('es')).toEqual(['B1', 'A1'])
  })
})
