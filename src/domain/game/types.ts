export type LocaleCode = 'ca' | 'en' | 'es' | 'eu' | 'gl' | 'va'

export interface GameConfig {
  players: string[]
  impostorMin: number // 1..impostorMax
  impostorMax: number // impostorMin..players-1
  impostorSeesClue: boolean
  impostorsSeeEachOther: boolean
  categoryIds: string[]
  locale: LocaleCode
}

export interface Player {
  id: string
  name: string
  isImpostor: boolean
}

export interface Assignment {
  players: Player[]
  word: string
  categoryId: string
  clue: string | null // the word's hint when impostorSeesClue, else null
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
