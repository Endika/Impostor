import { nextUsedWords } from '../../domain/content/usedWordCycle'
import type { LocaleCode } from '../../domain/game/types'

const keyFor = (locale: LocaleCode): string => `impostor.usedWords.${locale}`

export function loadUsedWords(locale: LocaleCode): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(keyFor(locale))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((w): w is string => typeof w === 'string')
  } catch {
    return []
  }
}

export function addUsedWord(locale: LocaleCode, word: string, pool: string[]): void {
  if (typeof window === 'undefined') return
  try {
    const next = nextUsedWords(loadUsedWords(locale), word, pool)
    window.localStorage.setItem(keyFor(locale), JSON.stringify(next))
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}
