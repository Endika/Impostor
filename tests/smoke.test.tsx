import { screen } from '@testing-library/react'
import App from '@/presentation/App'
import { renderWithProviders } from './helpers/renderWithProviders'

describe('App smoke', () => {
  it('renders the app name', () => {
    renderWithProviders(<App />)
    expect(screen.getByText('Impostor')).toBeInTheDocument()
  })
})
