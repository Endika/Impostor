import type { ReactElement, ReactNode } from 'react'
import { render, type RenderResult } from '@testing-library/react'
import { GameProvider } from '../../src/presentation/state/GameProvider'
import type { GameState } from '../../src/presentation/state/gameReducer'
import i18n from '../../src/presentation/i18n'

interface Options {
  initialState?: GameState
}

export function renderWithProviders(
  ui: ReactElement,
  { initialState }: Options = {},
): RenderResult {
  void i18n.changeLanguage('en')
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <GameProvider initialState={initialState}>{children}</GameProvider>
  )
  return render(ui, { wrapper: Wrapper })
}
