import { assignRoles } from '../../application/assignRoles'
import {
  resolveElimination,
  type EliminationResult,
} from '../../application/resolveElimination'
import type { WordBank } from '../../domain/content/types'
import type { Assignment, GameConfig, GameOutcome, Rng } from '../../domain/game/types'

export interface GameState {
  screen:
    | 'setup'
    | 'reveal'
    | 'round'
    | 'vote'
    | 'guess'
    | 'elimination'
    | 'result'
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
  | {
      type: 'START_GAME'
      config: GameConfig
      bank: WordBank
      rng: Rng
      excludeWords?: string[]
    }
  | { type: 'NEXT_REVEAL' }
  | { type: 'END_ROUND' }
  | { type: 'START_GUESS' }
  | { type: 'CANCEL_GUESS' }
  | { type: 'GUESS_FAILED'; playerId: string }
  | { type: 'CAST_VOTE'; votedPlayerId: string }
  | { type: 'NEXT_ROUND' }
  | { type: 'SHOW_RESULT' }
  | { type: 'IMPOSTOR_GUESSED_RIGHT' }
  | { type: 'PLAY_AGAIN' }
  | { type: 'RESET' }

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const assignment = assignRoles(
        action.config,
        action.bank,
        action.rng,
        action.excludeWords ?? [],
      )
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
    case 'START_GUESS': {
      if (!state.assignment) return state
      return { ...state, screen: 'guess' }
    }
    case 'CANCEL_GUESS': {
      return { ...state, screen: 'round' }
    }
    case 'GUESS_FAILED': {
      if (!state.assignment) return state
      const elim = resolveElimination(
        state.assignment,
        state.eliminatedIds,
        action.playerId,
      )
      const outcome: GameOutcome | null =
        elim.status === 'continue'
          ? null
          : {
              winner: elim.status === 'crew_win' ? 'crew' : 'impostors',
              votedWasImpostor: elim.votedWasImpostor,
              word: state.assignment.word,
              impostorIds: state.assignment.impostorIds,
            }
      // The risky guesser was wrong, so they are eliminated and the usual win
      // checks apply (e.g. if they were the last impostor, the crew wins).
      return {
        ...state,
        eliminatedIds: [...state.eliminatedIds, action.playerId],
        lastElimination: { ...elim, fromFailedGuess: true },
        votedPlayerId: action.playerId,
        outcome,
        screen: 'elimination',
      }
    }
    case 'CAST_VOTE': {
      if (!state.assignment) return state
      const elim = resolveElimination(
        state.assignment,
        state.eliminatedIds,
        action.votedPlayerId,
      )
      const outcome: GameOutcome | null =
        elim.status === 'continue'
          ? null
          : {
              winner: elim.status === 'crew_win' ? 'crew' : 'impostors',
              votedWasImpostor: elim.votedWasImpostor,
              word: state.assignment.word,
              impostorIds: state.assignment.impostorIds,
            }
      // Always land on the elimination screen, even on a terminal status, so
      // an eliminated impostor can still attempt a last-chance word guess.
      return {
        ...state,
        eliminatedIds: [...state.eliminatedIds, action.votedPlayerId],
        lastElimination: elim,
        votedPlayerId: action.votedPlayerId,
        outcome,
        screen: 'elimination',
      }
    }
    case 'NEXT_ROUND': {
      if (state.screen !== 'elimination') return state
      return { ...state, screen: 'round' }
    }
    case 'SHOW_RESULT': {
      return { ...state, screen: 'result' }
    }
    case 'IMPOSTOR_GUESSED_RIGHT': {
      if (!state.assignment) return state
      // An eliminated impostor said the word out loud and the group confirmed:
      // the impostors steal the win regardless of the elimination status.
      return {
        ...state,
        outcome: {
          winner: 'impostors',
          votedWasImpostor: true,
          word: state.assignment.word,
          impostorIds: state.assignment.impostorIds,
        },
        screen: 'result',
      }
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
