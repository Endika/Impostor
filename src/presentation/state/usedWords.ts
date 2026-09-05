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

export function addUsedWord(locale: LocaleCode, word: string): void {
  if (typeof window === 'undefined') return
  try {
    const current = loadUsedWords(locale)
    if (current.includes(word)) return
    window.localStorage.setItem(keyFor(locale), JSON.stringify([...current, word]))
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}
