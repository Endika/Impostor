import type { ComponentType } from 'react'
import { Layout } from './components/Layout'
import { useGame } from './state/useGame'
import { SetupScreen } from './screens/SetupScreen'
import { RevealScreen } from './screens/RevealScreen'
import { RoundScreen } from './screens/RoundScreen'
import { VoteScreen } from './screens/VoteScreen'
import { GuessScreen } from './screens/GuessScreen'
import { EliminationScreen } from './screens/EliminationScreen'
import { ResultScreen } from './screens/ResultScreen'
import type { GameState } from './state/gameReducer'

const SCREENS: Record<GameState['screen'], ComponentType> = {
  setup: SetupScreen,
  reveal: RevealScreen,
  round: RoundScreen,
  vote: VoteScreen,
  guess: GuessScreen,
  elimination: EliminationScreen,
  result: ResultScreen,
}

export default function App() {
  const { state } = useGame()
  const Screen = SCREENS[state.screen]
  return (
    <Layout>
      <Screen />
    </Layout>
  )
}
