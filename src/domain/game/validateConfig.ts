import type { GameConfig, ValidationResult } from './types'

export function validateConfig(c: GameConfig): ValidationResult {
  const names = c.players.map((n) => n.trim()).filter(Boolean)
  if (names.length < 3) return { ok: false, error: 'too_few_players' }
  if (new Set(names).size !== names.length)
    return { ok: false, error: 'duplicate_names' }
  if (
    !Number.isInteger(c.impostorCount) ||
    c.impostorCount < 1 ||
    c.impostorCount > names.length - 1
  )
    return { ok: false, error: 'invalid_impostor_count' }
  if (c.categoryIds.length === 0) return { ok: false, error: 'no_category' }
  return { ok: true }
}
