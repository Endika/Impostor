import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CircleHelp, Lightbulb, UserX } from 'lucide-react'
import { useGame } from '../state/useGame'
import { useAudio } from '../audio/useAudio'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Toggle } from '../components/Toggle'
import { DebateTimer, TENSE_FROM_SECONDS } from '../components/DebateTimer'
import { PeekCard } from '../components/PeekCard'
import { RulesSheet } from '../components/RulesSheet'
import type { Rng } from '../../domain/game/types'
import { drawByStreaks } from '../../domain/game/streakRotation'
import { loadOpenerStreaks } from '../state/openerStreaks'

const MUSIC_KEY = 'impostor.music'
const NAME_SLOT = '\u2063'

function loadMusicOn(): boolean {
  try {
    return window.localStorage.getItem(MUSIC_KEY) === 'true'
  } catch {
    return false
  }
}

interface RoundScreenProps {
  rng?: Rng
}

export function RoundScreen({ rng = Math.random }: RoundScreenProps) {
  const { t } = useTranslation()
  const { state, dispatch } = useGame()
  const { startLoop, stopLoop, play, muted } = useAudio()

  const { assignment, config, eliminatedIds, round, starterId } = state
  const alive = (assignment?.players ?? []).filter((p) => !eliminatedIds.includes(p.id))

  // The starter is drawn once per round and kept in the game state, so leaving
  // for a guess or reloading the app never reshuffles who opens the debate.
  const [drawn] = useState(() => {
    const index = drawByStreaks(
      alive.map((p) => p.name),
      1,
      loadOpenerStreaks(),
      rng,
    )[0]
    return index === undefined ? undefined : alive[index]
  })
  const starter = alive.find((p) => p.id === starterId) ?? drawn

  useEffect(() => {
    if (!starterId && drawn) dispatch({ type: 'SET_STARTER', playerId: drawn.id })
  }, [starterId, drawn, dispatch])

  const [musicOn, setMusicOn] = useState(loadMusicOn)
  const [tense, setTense] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [peekId, setPeekId] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (musicOn && !muted) startLoop(tense ? 'tense' : 'calm')
      else stopLoop()
    } catch {
      // background music is best-effort
    }
  }, [musicOn, muted, tense, startLoop, stopLoop])

  useEffect(() => () => stopLoop(), [stopLoop])

  function changeMusic(on: boolean) {
    setMusicOn(on)
    try {
      window.localStorage.setItem(MUSIC_KEY, String(on))
    } catch {
      // ignore persistence failures
    }
  }

  if (!assignment || !starter) return null

  const peeked = alive.find((p) => p.id === peekId)

  // Split the translated sentence around the name so only the name grows, whatever the word order.
  const [starterBefore = '', starterAfter = ''] = t('round.startsWith', {
    name: NAME_SLOT,
  }).split(NAME_SLOT)

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight">{t('round.title', { round })}</h1>
        <p className="text-2xl font-bold text-muted [overflow-wrap:anywhere]">
          {starterBefore}
          <span className="block py-1 text-6xl leading-none font-extrabold tracking-tight text-ink">
            {starter.name}
          </span>
          {starterAfter}
        </p>
      </div>

      <ul aria-label={t('round.players')} className="flex flex-wrap gap-2">
        {assignment.players.map((p) => {
          const out = eliminatedIds.includes(p.id)
          return (
            <li
              key={p.id}
              className={`flex min-h-10 items-center gap-1.5 rounded-full border-2 px-3.5 text-base font-bold ${
                out
                  ? 'border-transparent bg-surface text-muted line-through'
                  : 'border-line bg-raised'
              }`}
            >
              {out && <UserX aria-hidden size={16} strokeWidth={2.5} />}
              {out ? (
                <>
                  <span className="[overflow-wrap:anywhere]">{p.name}</span>
                  <span className="sr-only">{t('round.out')}</span>
                </>
              ) : (
                <button
                  type="button"
                  className="-mx-3.5 min-h-10 rounded-full px-3.5 [overflow-wrap:anywhere] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ink"
                  onClick={() => setPeekId(p.id)}
                >
                  {p.name}
                </button>
              )}
            </li>
          )
        })}
      </ul>
      <p className="-mt-3 text-base text-muted">{t('round.peekHint')}</p>

      <div className="flex flex-col items-start gap-1">
        <p className="text-lg text-muted">{t('round.reminder')}</p>
        <Button variant="ghost" size="sm" className="-ml-3" onClick={() => setRulesOpen(true)}>
          <CircleHelp aria-hidden size={18} strokeWidth={2.5} />
          {t('rules.open')}
        </Button>
      </div>

      <Card className="flex flex-col gap-2 p-4">
        <DebateTimer
          roundKey={`${assignment.word}:${round}`}
          onTick={(left, running) => setTense(running && left > 0 && left <= TENSE_FROM_SECONDS)}
          onTimeUp={() => {
            try {
              play('timeUp')
            } catch {
              // audio is best-effort
            }
          }}
        />
        <Toggle label={t('round.music')} checked={musicOn} onChange={changeMusic} />
      </Card>

      <div className="sticky bottom-0 mt-auto flex flex-col gap-3 bg-ground pt-2 pb-1">
        <Button size="lg" className="w-full" onClick={() => dispatch({ type: 'END_ROUND' })}>
          {t('round.vote')}
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => dispatch({ type: 'START_GUESS' })}
        >
          <Lightbulb aria-hidden size={20} strokeWidth={2.5} />
          {t('round.guess')}
        </Button>
      </div>

      {peeked && (
        <PeekCard
          player={peeked}
          assignment={assignment}
          impostorsSeeEachOther={config?.impostorsSeeEachOther ?? false}
          onClose={() => setPeekId(null)}
        />
      )}

      <RulesSheet open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  )
}
