import type { LocaleCode, Rng } from '../game/types'

export type CategoryData = Record<string, Partial<Record<LocaleCode, string[]>>>

export interface WordBank {
  pick(
    categoryIds: string[],
    locale: LocaleCode,
    rng: Rng,
  ): { word: string; categoryId: string }
}
