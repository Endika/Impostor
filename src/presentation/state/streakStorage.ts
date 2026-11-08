import { nextStreaks, streakOf } from '../../domain/game/streakRotation'

interface StoredStreaks {
  lastKey: string | null
  streaks: Record<string, number>
}

function loadStreakStore(storageKey: string, keyField: string): StoredStreaks {
  const empty: StoredStreaks = { lastKey: null, streaks: {} }
  if (typeof window === 'undefined') return empty
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return empty
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return empty
    const record = parsed as Record<string, unknown>
    const lastKey = record[keyField]
    const streaks = record.streaks
    const clean: Record<string, number> = {}
    if (typeof streaks === 'object' && streaks !== null && !Array.isArray(streaks)) {
      const source = streaks as Record<string, number>
      for (const name of Object.keys(source)) clean[name] = streakOf(source, name)
    }
    return { lastKey: typeof lastKey === 'string' ? lastKey : null, streaks: clean }
  } catch {
    return empty
  }
}

function saveStreakStore(storageKey: string, keyField: string, value: StoredStreaks): void {
  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ [keyField]: value.lastKey, streaks: value.streaks }),
    )
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

export function loadStreaks(storageKey: string, keyField: string): Record<string, number> {
  return loadStreakStore(storageKey, keyField).streaks
}

export function recordStreaks(
  storageKey: string,
  keyField: string,
  eventKey: string,
  players: { name: string; hit: boolean }[],
): void {
  const stored = loadStreakStore(storageKey, keyField)
  if (stored.lastKey === eventKey) return
  saveStreakStore(storageKey, keyField, {
    lastKey: eventKey,
    streaks: nextStreaks(stored.streaks, players),
  })
}
