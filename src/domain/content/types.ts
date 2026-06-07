import type { LocaleCode, Rng } from '../game/types'

/** A secret word plus a short hint shown to the impostor when clues are enabled. */
export interface WordEntry {
  word: string
  hint: string
}

export type CategoryData = Record<string, Partial<Record<LocaleCode, WordEntry[]>>>

export interface WordBank {
  pick(
    categoryIds: string[],
    locale: LocaleCode,
    rng: Rng,
    excludeWords?: string[],
  ): { word: string; categoryId: string; hint: string }
}
