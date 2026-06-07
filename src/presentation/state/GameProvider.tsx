import { useEffect, useReducer, useRef, type ReactNode } from 'react'
import { gameReducer, initialState, type GameState } from './gameReducer'
import { loadConfig, saveConfig } from './persistence'
import { GameContext } from './gameContext'

function init(base: GameState): GameState {
  const persisted = loadConfig()
  if (!persisted) return base
  return { ...base, config: { ...base.config, ...persisted } as GameState['config'] }
}

export function GameProvider({
  children,
  initialState: seededState,
}: {
  children: ReactNode
  initialState?: GameState
}) {
  const [state, dispatch] = useReducer(
    gameReducer,
    seededState ?? initialState,
    seededState ? (s) => s : init,
  )
  const lastSaved = useRef<GameState['config']>(null)

  useEffect(() => {
    if (state.config && state.config !== lastSaved.current) {
      lastSaved.current = state.config
      saveConfig(state.config)
    }
  }, [state.config])

  return (
    <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
  )
}
