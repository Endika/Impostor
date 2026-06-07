import type { LocaleCode, Rng } from '../game/types'

/** A secret word plus several short hints; impostors may each get a different one. */
export interface WordEntry {
  word: string
  hints: string[]
}

export type CategoryData = Record<string, Partial<Record<LocaleCode, WordEntry[]>>>

export interface WordBank {
  pick(
    categoryIds: string[],
    locale: LocaleCode,
    rng: Rng,
    excludeWords?: string[],
  ): { word: string; categoryId: string; hints: string[] }
}
