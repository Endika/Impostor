import type { GameConfig } from '../../domain/game/types'

const CONFIG_KEY = 'impostor.config'

export function loadConfig(): Partial<GameConfig> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Partial<GameConfig>
  } catch {
    return null
  }
}

export function saveConfig(config: GameConfig): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  } catch {
    // ignore persistence failures
  }
}
