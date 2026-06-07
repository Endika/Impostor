import { createContext, type Dispatch } from 'react'
import type { GameAction, GameState } from './gameReducer'

export interface GameContextValue {
  state: GameState
  dispatch: Dispatch<GameAction>
}

export const GameContext = createContext<GameContextValue | null>(null)
