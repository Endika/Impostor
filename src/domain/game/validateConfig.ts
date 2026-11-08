import type { GameConfig, ValidationResult } from './types'
import { maxImpostorsFor } from './impostorLimits'

export function validateConfig(c: GameConfig): ValidationResult {
  const names = c.players.map((n) => n.trim()).filter(Boolean)
  if (names.length < 3) return { ok: false, error: 'too_few_players' }
  if (names.length !== c.players.length) return { ok: false, error: 'empty_player' }
  if (new Set(names).size !== names.length) return { ok: false, error: 'duplicate_names' }
  // With randomImpostors the count is drawn at runtime; the draw clamps the maximum to the table limit.
  if (!c.randomImpostors) {
    const maxImpostors = maxImpostorsFor(names.length, c.impostorsSeeEachOther)
    if (!Number.isInteger(c.impostorCount) || c.impostorCount < 1 || c.impostorCount > maxImpostors)
      return { ok: false, error: 'invalid_impostor_count' }
  } else if (
    c.maxRandomImpostors !== undefined &&
    (!Number.isInteger(c.maxRandomImpostors) || c.maxRandomImpostors < 1)
  ) {
    return { ok: false, error: 'invalid_impostor_count' }
  }
  if (c.categoryIds.length === 0) return { ok: false, error: 'no_category' }
  return { ok: true }
}
