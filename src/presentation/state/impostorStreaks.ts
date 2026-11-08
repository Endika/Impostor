import type { Assignment } from '../../domain/game/types'
import { nextStreaks, streakOf } from '../../domain/game/impostorRotation'

const KEY = 'impostor.impostorStreaks'

interface StoredStreaks {
  lastAssignmentId: string | null
  streaks: Record<string, number>
}

function load(): StoredStreaks {
  const empty: StoredStreaks = { lastAssignmentId: null, streaks: {} }
  if (typeof window === 'undefined') return empty
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return empty
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return empty
    const { lastAssignmentId, streaks } = parsed as Record<string, unknown>
    const clean: Record<string, number> = {}
    if (typeof streaks === 'object' && streaks !== null && !Array.isArray(streaks)) {
      const source = streaks as Record<string, number>
      for (const name of Object.keys(source)) clean[name] = streakOf(source, name)
    }
    return {
      lastAssignmentId: typeof lastAssignmentId === 'string' ? lastAssignmentId : null,
      streaks: clean,
    }
  } catch {
    return empty
  }
}

export function loadImpostorStreaks(): Record<string, number> {
  return load().streaks
}

export function recordAssignment(assignment: Assignment): void {
  if (typeof window === 'undefined') return
  const id = assignment.players[0]?.id
  if (!id) return
  try {
    const stored = load()
    if (stored.lastAssignmentId === id) return
    const next: StoredStreaks = {
      lastAssignmentId: id,
      streaks: nextStreaks(stored.streaks, assignment.players),
    }
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}
