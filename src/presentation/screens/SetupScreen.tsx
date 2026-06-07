import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { categoryData, categoryIds } from '../../content/categories'
import { InMemoryWordBank } from '../../domain/content/InMemoryWordBank'
import { validateConfig } from '../../domain/game/validateConfig'
import type { GameConfig, LocaleCode } from '../../domain/game/types'
import { useGame } from '../state/useGame'
import { useAudio } from '../audio/useAudio'
import i18n from '../i18n'

const LOCALES: LocaleCode[] = ['ca', 'en', 'es', 'eu', 'gl', 'va']

const ERROR_KEY = {
  too_few_players: 'setup.errorTooFewPlayers',
  invalid_impostor_count: 'setup.errorInvalidImpostorCount',
  no_category: 'setup.errorNoCategory',
  duplicate_names: 'setup.errorDuplicateNames',
} as const

export function SetupScreen() {
  const { t } = useTranslation()
  const { dispatch } = useGame()
  const { muted, toggleMuted } = useAudio()

  const [players, setPlayers] = useState<string[]>(['', '', ''])
  const [impostorCount, setImpostorCount] = useState(1)
  const [impostorSeesClue, setImpostorSeesClue] = useState(false)
  const [impostorsSeeEachOther, setImpostorsSeeEachOther] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    ...categoryIds,
  ])
  const [locale, setLocale] = useState<LocaleCode>(
    (i18n.language as LocaleCode) ?? 'en',
  )
  const [error, setError] = useState<string | null>(null)

  const maxImpostors = Math.max(1, players.length - 1)

  function clampCount(count: number, max: number): number {
    if (count < 1) return 1
    if (count > max) return max
    return count
  }

  function updatePlayer(index: number, value: string) {
    setPlayers((prev) => prev.map((p, i) => (i === index ? value : p)))
  }

  function addPlayer() {
    setPlayers((prev) => [...prev, ''])
  }

  function removePlayer(index: number) {
    setPlayers((prev) => {
      const next = prev.filter((_, i) => i !== index)
      const max = Math.max(1, next.length - 1)
      setImpostorCount((c) => clampCount(c, max))
      return next
    })
  }

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    )
  }

  function changeLocale(code: LocaleCode) {
    setLocale(code)
    void i18n.changeLanguage(code)
  }

  const seeEachOtherDisabled = impostorCount < 2

  function handleStart() {
    const config: GameConfig = {
      players: players.map((p) => p.trim()),
      impostorCount,
      impostorSeesClue,
      impostorsSeeEachOther: seeEachOtherDisabled ? false : impostorsSeeEachOther,
      categoryIds: selectedCategories,
      locale,
    }
    const result = validateConfig(config)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError(null)
    dispatch({
      type: 'START_GAME',
      config,
      bank: new InMemoryWordBank(categoryData),
      rng: Math.random,
    })
  }

  const errorMessage = error
    ? t(ERROR_KEY[error as keyof typeof ERROR_KEY], {
        max: players.length - 1,
      })
    : null

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 p-4">
      <h1 className="text-2xl font-bold text-slate-100">{t('setup.title')}</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          {t('setup.players')}
        </h2>
        <ul className="flex flex-col gap-2">
          {players.map((name, index) => (
            <li key={index} className="flex items-center gap-2">
              <input
                aria-label={t('setup.playerName')}
                className="min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
                value={name}
                onChange={(e) => updatePlayer(index, e.target.value)}
                placeholder={`${t('setup.playerName')} ${index + 1}`}
              />
              {players.length > 3 && (
                <button
                  type="button"
                  aria-label={t('setup.removePlayer')}
                  className="shrink-0 rounded-lg border border-slate-600 px-3 py-2 text-slate-300"
                  onClick={() => removePlayer(index)}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="rounded-lg border border-slate-600 px-3 py-2 text-slate-200"
          onClick={addPlayer}
        >
          {t('setup.addPlayer')}
        </button>
      </section>

      <section className="flex flex-col gap-2">
        <label
          htmlFor="impostor-count"
          className="text-sm font-semibold uppercase tracking-wide text-slate-400"
        >
          {t('setup.impostorCount')}
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="-"
            className="h-10 w-10 shrink-0 rounded-lg border border-slate-600 text-xl text-slate-200"
            onClick={() =>
              setImpostorCount((c) => clampCount(c - 1, maxImpostors))
            }
          >
            −
          </button>
          <input
            id="impostor-count"
            type="number"
            min={1}
            max={maxImpostors}
            className="w-20 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-center text-slate-100"
            value={impostorCount}
            onChange={(e) => setImpostorCount(Number(e.target.value) || 1)}
          />
          <button
            type="button"
            aria-label="+"
            className="h-10 w-10 shrink-0 rounded-lg border border-slate-600 text-xl text-slate-200"
            onClick={() =>
              setImpostorCount((c) => clampCount(c + 1, maxImpostors))
            }
          >
            +
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <label className="flex items-center justify-between gap-3">
          <span className="text-slate-200">{t('setup.seesClue')}</span>
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={impostorSeesClue}
            onChange={(e) => setImpostorSeesClue(e.target.checked)}
          />
        </label>
        <label
          className={`flex items-center justify-between gap-3 ${
            seeEachOtherDisabled ? 'opacity-40' : ''
          }`}
        >
          <span className="text-slate-200">{t('setup.seeEachOther')}</span>
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={!seeEachOtherDisabled && impostorsSeeEachOther}
            disabled={seeEachOtherDisabled}
            onChange={(e) => setImpostorsSeeEachOther(e.target.checked)}
          />
        </label>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          {t('setup.categories')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {categoryIds.map((id) => {
            const active = selectedCategories.includes(id)
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 text-sm ${
                  active
                    ? 'border-indigo-400 bg-indigo-500/20 text-indigo-200'
                    : 'border-slate-600 text-slate-300'
                }`}
                onClick={() => toggleCategory(id)}
              >
                {t(`categories.${id}`)}
              </button>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <label
          htmlFor="language-select"
          className="text-sm font-semibold uppercase tracking-wide text-slate-400"
        >
          {t('setup.language')}
        </label>
        <select
          id="language-select"
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
          value={locale}
          onChange={(e) => changeLocale(e.target.value as LocaleCode)}
        >
          {LOCALES.map((code) => (
            <option key={code} value={code}>
              {code.toUpperCase()}
            </option>
          ))}
        </select>
      </section>

      <section>
        <label className="flex items-center justify-between gap-3">
          <span className="text-slate-200">{t('setup.audio')}</span>
          <button
            type="button"
            aria-pressed={!muted}
            className="rounded-lg border border-slate-600 px-4 py-2 text-slate-200"
            onClick={toggleMuted}
          >
            {muted ? t('common.off') : t('common.on')}
          </button>
        </label>
      </section>

      {errorMessage && (
        <p role="alert" className="rounded-lg bg-red-500/15 px-3 py-2 text-red-300">
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        className="mt-auto rounded-xl bg-indigo-500 px-4 py-3 text-lg font-semibold text-white"
        onClick={handleStart}
      >
        {t('setup.start')}
      </button>
    </div>
  )
}
