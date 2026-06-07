import { describe, it, expect } from 'vitest'
import en from '../../src/presentation/i18n/locales/en.json'
import es from '../../src/presentation/i18n/locales/es.json'
import ca from '../../src/presentation/i18n/locales/ca.json'
import eu from '../../src/presentation/i18n/locales/eu.json'
import gl from '../../src/presentation/i18n/locales/gl.json'
import va from '../../src/presentation/i18n/locales/va.json'

const keys = (o: object): string[] =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' ? Object.keys(v).map((c) => `${k}.${c}`) : [k]).sort()

describe('i18n locales', () => {
  const ref = keys(en)
  it.each([['es', es], ['ca', ca], ['eu', eu], ['gl', gl], ['va', va]] as const)(
    '%s has the same keys as en', (_n, loc) => expect(keys(loc)).toEqual(ref))
})
