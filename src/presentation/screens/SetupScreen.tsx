import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { categoryData, categoryIds } from '../../content/categories'
import { InMemoryWordBank } from '../../domain/content/InMemoryWordBank'
import { validateConfig } from '../../domain/game/validateConfig'
import type { GameConfig, LocaleCode } from '../../domain/game/types'
import { useGame } from '../state/useGame'
import { useAudio } from '../audio/useAudio'
import { Button } from '../components/Button'
import { SectionLabel } from '../components/Card'
import { loadConfig, saveConfig } from '../state/persistence'
import { loadUsedWords } from '../state/usedWords'
import i18n from '../i18n'

const LOCALES: LocaleCode[] = ['ca', 'en', 'es', 'eu', 'gl', 'va']

const maxImpostorsFor = (playerCount: number): number =>
  Math.max(1, Math.floor((playerCount - 1) / 2))

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

  // Prefill from the last saved config so participants are remembered.
  const [saved] = useState(() => loadConfig())

  const [players, setPlayers] = useState<string[]>(() =>
    saved?.players && saved.players.length >= 3
      ? saved.players
      : ['', '', ''],
  )
  const [impostorCount, setImpostorCount] = useState(
    () => saved?.impostorMin ?? 1,
  )
  const [impostorSeesClue, setImpostorSeesClue] = useState(
    () => saved?.impostorSeesClue ?? false,
  )
  const [impostorsSeeEachOther, setImpostorsSeeEachOther] = useState(
    () => saved?.impostorsSeeEachOther ?? false,
  )
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    saved?.categoryIds && saved.categoryIds.length > 0
      ? saved.categoryIds
      : [...categoryIds],
  )
  const [locale, setLocale] = useState<LocaleCode>(
    () => saved?.locale ?? (i18n.language as LocaleCode) ?? 'en',
  )
  const [error, setError] = useState<string | null>(null)

  // Apply the remembered language once on mount.
  useEffect(() => {
    if (saved?.locale && i18n.language !== saved.locale) {
      void i18n.changeLanguage(saved.locale)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const maxImpostors = maxImpostorsFor(players.length)

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
      const max = maxImpostorsFor(next.length)
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
      impostorMin: impostorCount,
      impostorMax: impostorCount,
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
    saveConfig(config)
    dispatch({
      type: 'START_GAME',
      config,
      bank: new InMemoryWordBank(categoryData),
      rng: Math.random,
      excludeWords: loadUsedWords(config.locale),
    })
  }

  const errorMessage = error
    ? t(ERROR_KEY[error as keyof typeof ERROR_KEY], {
        max: maxImpostors,
      })
    : null

  return (
    <div className="rise-in flex min-h-full flex-1 flex-col gap-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
        {t('setup.title')}
      </h1>

      <section className="flex flex-col gap-3">
        <SectionLabel>{t('setup.players')}</SectionLabel>
        <ul className="flex flex-col gap-2">
          {players.map((name, index) => (
            <li key={index} className="flex items-center gap-2">
              <input
                aria-label={t('setup.playerName')}
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300/80 bg-white/80 px-3.5 py-2.5 text-slate-900 shadow-sm backdrop-blur placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100"
                value={name}
                onChange={(e) => updatePlayer(index, e.target.value)}
                placeholder={`${t('setup.playerName')} ${index + 1}`}
              />
              {players.length > 3 && (
                <Button
                  variant="ghost"
                  aria-label={t('setup.removePlayer')}
                  className="shrink-0 px-3"
                  onClick={() => removePlayer(index)}
                >
                  ✕
                </Button>
              )}
            </li>
          ))}
        </ul>
        <Button variant="secondary" onClick={addPlayer}>
          {t('setup.addPlayer')}
        </Button>
      </section>

      <section className="flex flex-col gap-2">
        <label
          htmlFor="impostor-count"
          className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
        >
          {t('setup.impostorCount')}
        </label>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            aria-label="-"
            className="h-11 w-11 shrink-0 px-0 text-xl"
            onClick={() =>
              setImpostorCount((c) => clampCount(c - 1, maxImpostors))
            }
          >
            −
          </Button>
          <input
            id="impostor-count"
            type="number"
            min={1}
            max={maxImpostors}
            className="min-h-11 w-20 rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 text-center text-lg font-bold text-slate-900 shadow-sm backdrop-blur focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100"
            value={impostorCount}
            onChange={(e) => setImpostorCount(Number(e.target.value) || 1)}
          />
          <Button
            variant="secondary"
            aria-label="+"
            className="h-11 w-11 shrink-0 px-0 text-xl"
            onClick={() =>
              setImpostorCount((c) => clampCount(c + 1, maxImpostors))
            }
          >
            +
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur-sm transition hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800/70">
          <span className="text-slate-700 dark:text-slate-200">
            {t('setup.seesClue')}
          </span>
          <input
            type="checkbox"
            className="h-5 w-5 accent-brand-600"
            checked={impostorSeesClue}
            onChange={(e) => setImpostorSeesClue(e.target.checked)}
          />
        </label>
        <label
          className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur-sm transition hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800/70 ${
            seeEachOtherDisabled ? 'opacity-40' : ''
          }`}
        >
          <span className="text-slate-700 dark:text-slate-200">
            {t('setup.seeEachOther')}
          </span>
          <input
            type="checkbox"
            className="h-5 w-5 accent-brand-600"
            checked={!seeEachOtherDisabled && impostorsSeeEachOther}
            disabled={seeEachOtherDisabled}
            onChange={(e) => setImpostorsSeeEachOther(e.target.checked)}
          />
        </label>
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>{t('setup.categories')}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {categoryIds.map((id) => {
            const active = selectedCategories.includes(id)
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-[0.95] ${
                  active
                    ? 'border-transparent bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-sm shadow-brand-600/25'
                    : 'border-slate-300/80 bg-white/60 text-slate-600 backdrop-blur hover:bg-white dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800'
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
          className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
        >
          {t('setup.language')}
        </label>
        <select
          id="language-select"
          className="min-h-11 rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 text-slate-900 shadow-sm backdrop-blur focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100"
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
        <label className="flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-slate-700 dark:text-slate-200">
            {t('setup.audio')}
          </span>
          <Button
            variant="ghost"
            aria-pressed={!muted}
            className="px-4"
            onClick={toggleMuted}
          >
            {muted ? t('common.off') : t('common.on')}
          </Button>
        </label>
      </section>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300"
        >
          {errorMessage}
        </p>
      )}

      <Button size="lg" className="mt-auto w-full" onClick={handleStart}>
        {t('setup.start')}
      </Button>
    </div>
  )
}
