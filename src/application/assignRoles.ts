import { uuidv7 } from 'uuidv7'
import type { Assignment, GameConfig, Player, Rng } from '../domain/game/types'
import type { WordBank } from '../domain/content/types'
import { maxRandomImpostorsFor } from '../domain/game/impostorLimits'

export function assignRoles(
  config: GameConfig,
  bank: WordBank,
  rng: Rng,
  excludeWords: string[] = [],
): Assignment {
  const impostorCount = config.randomImpostors
    ? drawImpostorCount(config, rng)
    : config.impostorCount
  const { word, categoryId, hints } = bank.pick(
    config.categoryIds,
    config.locale,
    rng,
    excludeWords,
  )
  const indices = config.players.map((_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j]!, indices[i]!]
  }
  const impostorOrder = indices.slice(0, impostorCount)
  const impostorRank = new Map(impostorOrder.map((idx, rank) => [idx, rank]))

  // Decide each impostor's personal clue.
  const cluesByRank = ((): (string | null)[] => {
    if (!config.impostorSeesClue) return impostorOrder.map(() => null)
    if (config.differentCluePerImpostor && impostorCount > 1) {
      const shuffled = [...hints]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
      }
      return impostorOrder.map((_, rank) => shuffled[rank % shuffled.length] ?? null)
    }
    const shared = hints[Math.floor(rng() * hints.length)] ?? null
    return impostorOrder.map(() => shared)
  })()

  const players: Player[] = config.players.map((name, i) => {
    const rank = impostorRank.get(i)
    return {
      id: uuidv7(),
      name,
      isImpostor: rank !== undefined,
      clue: rank !== undefined ? (cluesByRank[rank] ?? null) : null,
    }
  })
  return {
    players,
    word,
    categoryId,
    impostorIds: players.filter((p) => p.isImpostor).map((p) => p.id),
  }
}

function drawImpostorCount(config: GameConfig, rng: Rng): number {
  const limit = maxRandomImpostorsFor(config.players.length, config.impostorsSeeEachOther)
  const max = Math.max(1, Math.min(config.maxRandomImpostors ?? limit, limit))
  return 1 + Math.floor(rng() * max)
}
