import type { CategoryData } from '../domain/content/types'
import { home } from './categories/home'
import { food } from './categories/food'
import { animals } from './categories/animals'
import { music } from './categories/music'
import { places } from './categories/places'
import { cinema } from './categories/cinema'
import { nature } from './categories/nature'
import { transport } from './categories/transport'

export const categoryIds = [
  'home',
  'food',
  'animals',
  'music',
  'places',
  'cinema',
  'nature',
  'transport',
] as const

export const categoryData: CategoryData = {
  home,
  food,
  animals,
  music,
  places,
  cinema,
  nature,
  transport,
}
