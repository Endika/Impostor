import { assignRoles } from '../../application/assignRoles'
import {
  resolveElimination,
  type EliminationResult,
} from '../../application/resolveElimination'
import type { WordBank } from '../../domain/content/types'
import type { Assignment, GameConfig, GameOutcome, Rng } from '../../domain/game/types'

export interface GameState {
  screen: 'setup' | 'reveal' | 'round' | 'vote' | 'elimination' | 'result'
  config: GameConfig | null
  assignment: Assignment | null
  revealIndex: number
  outcome: GameOutcome | null
  votedPlayerId: string | null
  eliminatedIds: string[]
  lastElimination: EliminationResult | null
}

export const initialState: GameState = {
  screen: 'setup',
  config: null,
  assignment: null,
  revealIndex: 0,
  outcome: null,
  votedPlayerId: null,
  eliminatedIds: [],
  lastElimination: null,
}

export type GameAction =
  | { type: 'START_GAME'; config: GameConfig; bank: WordBank; rng: Rng }
  | { type: 'NEXT_REVEAL' }
  | { type: 'END_ROUND' }
  | { type: 'CAST_VOTE'; votedPlayerId: string }
  | { type: 'NEXT_ROUND' }
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
        votedPlayerId: null,
        eliminatedIds: [],
        lastElimination: null,
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
      const elim = resolveElimination(
        state.assignment,
        state.eliminatedIds,
        action.votedPlayerId,
      )
      const base = {
        ...state,
        eliminatedIds: [...state.eliminatedIds, action.votedPlayerId],
        lastElimination: elim,
        votedPlayerId: action.votedPlayerId,
      }
      if (elim.status === 'continue') {
        return { ...base, screen: 'elimination' }
      }
      return {
        ...base,
        screen: 'result',
        outcome: {
          winner: elim.status === 'crew_win' ? 'crew' : 'impostors',
          votedWasImpostor: elim.votedWasImpostor,
          word: state.assignment.word,
          impostorIds: state.assignment.impostorIds,
        },
      }
    }
    case 'NEXT_ROUND': {
      if (state.screen !== 'elimination') return state
      return { ...state, screen: 'round' }
    }
    case 'PLAY_AGAIN': {
      return {
        ...state,
        assignment: null,
        outcome: null,
        votedPlayerId: null,
        revealIndex: 0,
        eliminatedIds: [],
        lastElimination: null,
        screen: 'setup',
      }
    }
    case 'RESET':
      return initialState
    default:
      return state
  }
}
