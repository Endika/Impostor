import { useEffect, useRef, type ComponentType } from 'react'
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
  const firstScreen = useRef(true)

  // The button that moved us here unmounts with the old screen, so hand focus
  // to the new screen's heading; keyboard and screen-reader users land on it.
  useEffect(() => {
    if (firstScreen.current) {
      firstScreen.current = false
      return
    }
    const heading = document.querySelector<HTMLElement>('main h1')
    if (!heading) return
    heading.tabIndex = -1
    heading.focus()
  }, [state.screen])

  return (
    <Layout>
      <Screen />
    </Layout>
  )
}
