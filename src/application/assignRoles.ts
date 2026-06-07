import { uuidv7 } from 'uuidv7'
import type { Assignment, GameConfig, Player, Rng } from '../domain/game/types'
import type { WordBank } from '../domain/content/types'

export function assignRoles(
  config: GameConfig,
  bank: WordBank,
  rng: Rng,
  excludeWords: string[] = [],
): Assignment {
  const picked = bank.pick(config.categoryIds, config.locale, rng, excludeWords)
  const { word, categoryId, hint } = picked
  const indices = config.players.map((_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j]!, indices[i]!]
  }
  const impostorSet = new Set(indices.slice(0, config.impostorCount))
  const players: Player[] = config.players.map((name, i) => ({
    id: uuidv7(),
    name,
    isImpostor: impostorSet.has(i),
  }))
  return {
    players,
    word,
    categoryId,
    clue: config.impostorSeesClue ? hint : null,
    impostorIds: players.filter((p) => p.isImpostor).map((p) => p.id),
  }
}
