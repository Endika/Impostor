import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './presentation/App'
import { GameProvider } from './presentation/state/GameProvider'
import './presentation/i18n'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </StrictMode>,
)
