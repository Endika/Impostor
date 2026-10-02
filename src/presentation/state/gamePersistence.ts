import type { GameState } from './gameReducer'

const GAME_KEY = 'impostor.game'

const IN_PROGRESS: ReadonlySet<GameState['screen']> = new Set([
  'reveal',
  'round',
  'vote',
  'guess',
  'elimination',
])

export function isInProgress(state: GameState): boolean {
  return IN_PROGRESS.has(state.screen) && state.assignment !== null && state.config !== null
}

/** Keeps a game in progress on the device so a reload or a killed PWA resumes it. */
export function saveGame(state: GameState): void {
  if (typeof window === 'undefined') return
  try {
    if (isInProgress(state)) {
      window.localStorage.setItem(GAME_KEY, JSON.stringify(state))
    } else {
      window.localStorage.removeItem(GAME_KEY)
    }
  } catch {
    // ignore persistence failures
  }
}

export function loadGame(): GameState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(GAME_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<GameState>
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !IN_PROGRESS.has(parsed.screen as GameState['screen']) ||
      !parsed.assignment ||
      !parsed.config ||
      !Array.isArray(parsed.eliminatedIds)
    ) {
      return null
    }
    return {
      revealIndex: 0,
      outcome: null,
      votedPlayerId: null,
      lastElimination: null,
      guesserId: null,
      ...parsed,
    } as GameState
  } catch {
    return null
  }
}
