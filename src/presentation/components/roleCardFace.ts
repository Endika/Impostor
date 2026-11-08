import type { TFunction } from 'i18next'
import type { Assignment, Player } from '../../domain/game/types'

export interface RoleCardFace {
  title: string
  display: string
  support: string
}

/** What the back of a player's card says; every role fills the same three lines. */
export function roleCardFace(
  player: Player,
  assignment: Assignment,
  impostorsSeeEachOther: boolean,
  t: TFunction,
): RoleCardFace {
  if (!player.isImpostor) {
    return { title: t('reveal.crew'), display: assignment.word, support: t('reveal.crewHint') }
  }
  const others = assignment.players.filter((p) => p.isImpostor && p.id !== player.id)
  const names =
    impostorsSeeEachOther && assignment.impostorIds.length >= 2 && others.length > 0
      ? others.map((p) => p.name).join(', ')
      : null
  return {
    title: t('reveal.impostor'),
    display: player.clue ?? t('reveal.noClueWord'),
    support: [
      player.clue ? t('reveal.clueHint') : t('reveal.noClueHint'),
      names && t('reveal.withImpostors', { names }),
    ]
      .filter(Boolean)
      .join(' · '),
  }
}
