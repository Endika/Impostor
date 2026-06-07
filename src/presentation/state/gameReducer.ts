import { assignRoles } from '../../application/assignRoles'
import { resolveOutcome } from '../../application/resolveOutcome'
import type { WordBank } from '../../domain/content/types'
import type { Assignment, GameConfig, GameOutcome, Rng } from '../../domain/game/types'

export interface GameState {
  screen: 'setup' | 'reveal' | 'round' | 'vote' | 'result'
  config: GameConfig | null
  assignment: Assignment | null
  revealIndex: number
  outcome: GameOutcome | null
}

export const initialState: GameState = {
  screen: 'setup',
  config: null,
  assignment: null,
  revealIndex: 0,
  outcome: null,
}

export type GameAction =
  | { type: 'START_GAME'; config: GameConfig; bank: WordBank; rng: Rng }
  | { type: 'NEXT_REVEAL' }
  | { type: 'END_ROUND' }
  | { type: 'CAST_VOTE'; votedPlayerId: string }
  | { type: 'PLAY_AGAIN' }
  | { type: 'RESET' }

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const assignment = assignRoles(action.config, action.bank, action.rng)
      return {
        ...state,
        config: action.config,
        assignment,
        revealIndex: 0,
        outcome: null,
        screen: 'reveal',
      }
    }
    case 'NEXT_REVEAL': {
      if (!state.assignment) return state
      const next = state.revealIndex + 1
      if (next >= state.assignment.players.length) {
        return { ...state, revealIndex: next, screen: 'round' }
      }
      return { ...state, revealIndex: next }
    }
    case 'END_ROUND': {
      if (!state.assignment) return state
      return { ...state, screen: 'vote' }
    }
    case 'CAST_VOTE': {
      if (!state.assignment) return state
      const outcome = resolveOutcome(state.assignment, {
        votedPlayerId: action.votedPlayerId,
      })
      return { ...state, outcome, screen: 'result' }
    }
    case 'PLAY_AGAIN': {
      return {
        ...state,
        assignment: null,
        outcome: null,
        revealIndex: 0,
        screen: 'setup',
      }
    }
    case 'RESET':
      return initialState
    default:
      return state
  }
}
