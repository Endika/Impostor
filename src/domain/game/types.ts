export type LocaleCode = 'ca' | 'en' | 'es' | 'eu' | 'gl' | 'va'

export interface GameConfig {
  players: string[]
  impostorMin: number // 1..impostorMax
  impostorMax: number // impostorMin..players-1
  impostorSeesClue: boolean
  impostorsSeeEachOther: boolean
  differentCluePerImpostor: boolean // each impostor gets a distinct hint of the word
  categoryIds: string[]
  locale: LocaleCode
}

export interface Player {
  id: string
  name: string
  isImpostor: boolean
  clue: string | null // this impostor's personal hint (null for crew / when clues off)
}

export interface Assignment {
  players: Player[]
  word: string
  categoryId: string
  impostorIds: string[]
}

export interface Vote {
  votedPlayerId: string
}

export interface GameOutcome {
  winner: 'crew' | 'impostors'
  votedWasImpostor: boolean
  word: string
  impostorIds: string[]
}

export type Rng = () => number // [0,1), injectable for determinism

export type ValidationResult =
  | { ok: true }
  | {
      ok: false
      error:
        | 'too_few_players'
        | 'invalid_impostor_count'
        | 'no_category'
        | 'duplicate_names'
    }
