import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { categoryData, categoryIds } from '../../content/categories'
import { InMemoryWordBank } from '../../domain/content/InMemoryWordBank'
import { validateConfig } from '../../domain/game/validateConfig'
import type { GameConfig, LocaleCode } from '../../domain/game/types'
import { useGame } from '../state/useGame'
import { useAudio } from '../audio/useAudio'
import { Check, ChevronDown, CircleHelp, Plus, Settings2, X } from 'lucide-react'
import { Button } from '../components/Button'
import { Card, SectionLabel } from '../components/Card'
import { Input } from '../components/Input'
import { Stepper } from '../components/Stepper'
import { Toggle } from '../components/Toggle'
import { RulesSheet } from '../components/RulesSheet'
import { loadConfig, saveConfig } from '../state/persistence'
import { loadUsedWords } from '../state/usedWords'
import i18n from '../i18n'

const LOCALES: LocaleCode[] = ['ca', 'en', 'es', 'eu', 'gl', 'va']

// Each language is listed in its own name so anyone can find theirs.
const LOCALE_NAMES: Record<LocaleCode, string> = {
  ca: 'Català',
  en: 'English',
  es: 'Español',
  eu: 'Euskara',
  gl: 'Galego',
  va: 'Valencià',
}

const maxImpostorsFor = (playerCount: number): number => Math.max(1, playerCount - 1)

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
  const settingsId = useId()

  // Prefill from the last saved config so participants are remembered.
  const [saved] = useState(() => loadConfig())

  const [players, setPlayers] = useState<string[]>(() =>
    saved?.players && saved.players.length >= 3 ? saved.players : ['', '', ''],
  )
  const [impostorCount, setImpostorCount] = useState(() => saved?.impostorCount ?? 1)
  const [randomImpostors, setRandomImpostors] = useState(() => saved?.randomImpostors ?? false)
  const [impostorSeesClue, setImpostorSeesClue] = useState(() => saved?.impostorSeesClue ?? false)
  const [impostorsSeeEachOther, setImpostorsSeeEachOther] = useState(
    () => saved?.impostorsSeeEachOther ?? false,
  )
  const [differentCluePerImpostor, setDifferentCluePerImpostor] = useState(
    () => saved?.differentCluePerImpostor ?? false,
  )
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    saved?.categoryIds && saved.categoryIds.length > 0 ? saved.categoryIds : [...categoryIds],
  )
  const [locale, setLocale] = useState<LocaleCode>(
    () => saved?.locale ?? (i18n.language as LocaleCode) ?? 'en',
  )
  const [error, setError] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)

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

  // The upper bound (players - 1) is enforced by validateConfig on Start so an
  // out-of-range value still surfaces the invalid-count error.
  function changeCount(value: number) {
    setImpostorCount(clampCount(value, maxImpostors))
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

  // At least two impostors are possible either when random mode could draw them
  // (players - 1 >= 2) or when the fixed count is already >= 2.
  const twoImpostorsPossible = randomImpostors ? maxImpostors >= 2 : impostorCount >= 2

  // The game might have >= 2 impostors, so enable the toggle when possible.
  const seeEachOtherDisabled = !twoImpostorsPossible

  // A different clue per impostor only makes sense when clues are on AND there
  // can be at least two impostors to differentiate.
  const differentClueDisabled = !impostorSeesClue || !twoImpostorsPossible

  function handleStart() {
    const config: GameConfig = {
      players: players.map((p) => p.trim()),
      impostorCount,
      randomImpostors,
      impostorSeesClue,
      impostorsSeeEachOther: seeEachOtherDisabled ? false : impostorsSeeEachOther,
      differentCluePerImpostor: differentClueDisabled ? false : differentCluePerImpostor,
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

  const settingsSummary = [
    impostorSeesClue ? t('setup.summaryClue') : t('setup.summaryNoClue'),
    t('setup.summaryCategories', { count: selectedCategories.length }),
    LOCALE_NAMES[locale],
  ].join(' · ')

  return (
    <div className="flex flex-1 flex-col gap-7">
      <h1 className="text-4xl font-extrabold tracking-tight">{t('setup.title')}</h1>

      <section className="flex flex-col gap-3">
        <SectionLabel>{t('setup.players')}</SectionLabel>
        <ul className="flex flex-col gap-2">
          {players.map((name, index) => (
            <li key={index} className="flex items-center gap-2">
              <Input
                aria-label={t('setup.playerName')}
                className="flex-1"
                value={name}
                maxLength={16}
                autoComplete="off"
                enterKeyHint="next"
                onChange={(e) => updatePlayer(index, e.target.value)}
                placeholder={`${t('setup.playerName')} ${index + 1}`}
              />
              {players.length > 3 && (
                <Button
                  variant="ghost"
                  aria-label={
                    name.trim()
                      ? t('setup.removePlayerNamed', { name: name.trim() })
                      : t('setup.removePlayerNumber', { number: index + 1 })
                  }
                  size="icon"
                  onClick={() => removePlayer(index)}
                >
                  <X aria-hidden size={22} strokeWidth={2.5} />
                </Button>
              )}
            </li>
          ))}
        </ul>
        <Button variant="secondary" onClick={addPlayer}>
          <Plus aria-hidden size={20} strokeWidth={2.75} />
          {t('setup.addPlayer')}
        </Button>
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <SectionLabel id="impostor-count-label">{t('setup.impostors')}</SectionLabel>
          <Stepper
            value={impostorCount}
            min={1}
            max={maxImpostors}
            onChange={changeCount}
            label={t('setup.impostorCount')}
            decreaseLabel={t('setup.fewerImpostors')}
            increaseLabel={t('setup.moreImpostors')}
            disabled={randomImpostors}
          />
        </div>
        <Toggle
          label={t('setup.randomImpostors')}
          checked={randomImpostors}
          onChange={setRandomImpostors}
        />
      </section>

      <section className="flex flex-col">
        <button
          type="button"
          aria-expanded={settingsOpen}
          aria-controls={settingsId}
          className="flex min-h-14 items-center gap-3 rounded-2xl border-2 border-line bg-surface px-4 py-3 text-left transition-colors hover:border-line-strong focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/70"
          onClick={() => setSettingsOpen((o) => !o)}
        >
          <Settings2 aria-hidden size={22} strokeWidth={2.5} className="shrink-0 text-muted" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="font-bold">{t('setup.settings')}</span>
            <span className="truncate text-sm text-muted">{settingsSummary}</span>
          </span>
          <ChevronDown
            aria-hidden
            size={22}
            strokeWidth={2.5}
            className={`shrink-0 text-muted transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <div id={settingsId} hidden={!settingsOpen}>
          <Card className="mt-2 flex flex-col gap-5 p-4">
            <div className="flex flex-col">
              <Toggle
                label={t('setup.seesClue')}
                checked={impostorSeesClue}
                onChange={setImpostorSeesClue}
              />
              <Toggle
                label={t('setup.seeEachOther')}
                checked={!seeEachOtherDisabled && impostorsSeeEachOther}
                disabled={seeEachOtherDisabled}
                disabledReason={t('setup.needsTwoImpostors')}
                onChange={setImpostorsSeeEachOther}
              />
              <Toggle
                label={t('setup.differentClue')}
                checked={!differentClueDisabled && differentCluePerImpostor}
                disabled={differentClueDisabled}
                disabledReason={
                  impostorSeesClue ? t('setup.needsTwoImpostors') : t('setup.needsClue')
                }
                onChange={setDifferentCluePerImpostor}
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <SectionLabel>{t('setup.categories')}</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {categoryIds.map((id) => {
                  const active = selectedCategories.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={active}
                      className={`flex min-h-11 items-center gap-1.5 rounded-full border-2 px-4 text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/70 ${
                        active
                          ? 'border-ink bg-raised text-ink'
                          : 'border-line text-muted hover:text-ink'
                      }`}
                      onClick={() => toggleCategory(id)}
                    >
                      {active && <Check aria-hidden size={16} strokeWidth={3} />}
                      {t(`categories.${id}`)}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <label htmlFor="language-select" className="text-base font-bold">
                {t('setup.language')}
              </label>
              <select
                id="language-select"
                className="min-h-12 rounded-2xl border-2 border-line bg-raised px-3 text-lg text-ink focus:border-ink focus:outline-none"
                value={locale}
                onChange={(e) => changeLocale(e.target.value as LocaleCode)}
              >
                {LOCALES.map((code) => (
                  <option key={code} value={code} lang={code === 'va' ? 'ca-valencia' : code}>
                    {LOCALE_NAMES[code]}
                  </option>
                ))}
              </select>
            </div>

            <Toggle label={t('setup.audio')} checked={!muted} onChange={toggleMuted} />
          </Card>
        </div>
      </section>

      <Button variant="ghost" className="self-start" onClick={() => setRulesOpen(true)}>
        <CircleHelp aria-hidden size={20} strokeWidth={2.5} />
        {t('rules.open')}
      </Button>

      <div className="sticky bottom-0 mt-auto flex flex-col gap-3 bg-ground pt-2 pb-1">
        {errorMessage && (
          <p
            role="alert"
            className="rounded-2xl border-2 border-danger px-4 py-3 font-bold text-danger"
          >
            {errorMessage}
          </p>
        )}
        <Button size="lg" className="w-full" onClick={handleStart}>
          {t('setup.start')}
        </Button>
      </div>

      <RulesSheet open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  )
}
