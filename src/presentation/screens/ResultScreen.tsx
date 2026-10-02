import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw, Settings2, Trophy, VenetianMask } from 'lucide-react'
import { categoryData } from '../../content/categories'
import { InMemoryWordBank } from '../../domain/content/InMemoryWordBank'
import { useGame } from '../state/useGame'
import { useAudio } from '../audio/useAudio'
import { loadUsedWords } from '../state/usedWords'
import { Button } from '../components/Button'
import { Card } from '../components/Card'

// Crew-win confetti from the palette; hidden under prefers-reduced-motion.
const CONFETTI = [
  { left: '8%', color: 'var(--color-ground)', delay: '0s', dx: '-12px' },
  { left: '20%', color: 'var(--color-warn)', delay: '0.4s', dx: '8px' },
  { left: '33%', color: 'var(--color-muted)', delay: '0.9s', dx: '-6px' },
  { left: '46%', color: 'var(--color-ink)', delay: '0.2s', dx: '10px' },
  { left: '58%', color: 'var(--color-ground)', delay: '1.1s', dx: '-10px' },
  { left: '70%', color: 'var(--color-warn)', delay: '0.6s', dx: '6px' },
  { left: '82%', color: 'var(--color-muted)', delay: '0.1s', dx: '-8px' },
  { left: '92%', color: 'var(--color-ink)', delay: '0.8s', dx: '12px' },
] as const

export function ResultScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = useGame()
  const { play } = useAudio()

  const { assignment, outcome, votedPlayerId, guesserId, config } = state

  const crewWon = outcome?.winner === 'crew'

  useEffect(() => {
    if (!outcome) return
    try {
      play(crewWon ? 'victoryCrew' : 'victoryImpostor')
    } catch {
      // audio is best-effort
    }
  }, [outcome, crewWon, play])

  if (!assignment || !outcome) return null

  const nameById = (id: string) => assignment.players.find((p) => p.id === id)?.name ?? id

  const votedName = votedPlayerId ? nameById(votedPlayerId) : ''
  const impostorNames = outcome.impostorIds.map(nameById).join(', ')

  function rematch() {
    if (!config) return
    dispatch({
      type: 'START_GAME',
      config,
      bank: new InMemoryWordBank(categoryData),
      rng: Math.random,
      excludeWords: loadUsedWords(config.locale),
    })
  }

  const Icon = crewWon ? Trophy : VenetianMask

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div
        className={`verdict-in relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl px-6 py-10 text-center text-on-color shadow-card ${
          crewWon ? 'bg-positive' : 'bg-warn'
        }`}
      >
        {crewWon && (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {CONFETTI.map((c, i) => (
              <span
                key={i}
                className="confetti-piece"
                style={{
                  left: c.left,
                  background: c.color,
                  animationDelay: c.delay,
                  ['--dx' as string]: c.dx,
                }}
              />
            ))}
          </div>
        )}
        <Icon aria-hidden size={56} strokeWidth={2.25} />
        <h1 className="text-4xl leading-tight font-extrabold text-balance">
          {crewWon ? t('result.crewWins') : t('result.impostorWins')}
        </h1>
        <p className="text-lg font-bold text-balance [overflow-wrap:anywhere]">
          {guesserId
            ? t('result.guessedWord', { name: nameById(guesserId) })
            : outcome.votedWasImpostor
              ? t('result.isImpostor', { name: votedName })
              : t('result.notImpostor', { name: votedName })}
        </p>
      </div>

      <Card className="grid grid-cols-2 items-end gap-x-4 gap-y-1 p-5">
        <span className="text-sm font-bold text-muted">{t('result.theWordWas')}</span>
        <span className="text-sm font-bold text-muted">{t('result.theImpostorsWere')}</span>
        <span className="self-start text-2xl font-extrabold [overflow-wrap:anywhere]">
          {outcome.word}
        </span>
        <span className="self-start text-2xl font-extrabold [overflow-wrap:anywhere]">
          {impostorNames}
        </span>
      </Card>

      <div className="mt-auto flex flex-col gap-3">
        <Button size="lg" className="w-full" disabled={!config} onClick={rematch}>
          <RotateCcw aria-hidden size={22} strokeWidth={2.75} />
          {t('result.rematch')}
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => dispatch({ type: 'PLAY_AGAIN' })}
        >
          <Settings2 aria-hidden size={20} strokeWidth={2.5} />
          {t('result.playAgain')}
        </Button>
      </div>
    </div>
  )
}
