import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../state/useGame'
import { useAudio } from '../audio/useAudio'
import { Button } from '../components/Button'

// Static confetti specs for the crew-win banner (cheap CSS-only celebration).
// Emerald/amber/violet/white mix; disabled under prefers-reduced-motion via CSS.
const CONFETTI = [
  { left: '8%', color: '#34d399', delay: '0s', dx: '-12px' },
  { left: '20%', color: '#fbbf24', delay: '0.4s', dx: '8px' },
  { left: '33%', color: '#a78bfa', delay: '0.9s', dx: '-6px' },
  { left: '46%', color: '#ffffff', delay: '0.2s', dx: '10px' },
  { left: '58%', color: '#34d399', delay: '1.1s', dx: '-10px' },
  { left: '70%', color: '#fbbf24', delay: '0.6s', dx: '6px' },
  { left: '82%', color: '#a78bfa', delay: '0.1s', dx: '-8px' },
  { left: '92%', color: '#ffffff', delay: '0.8s', dx: '12px' },
] as const

export function ResultScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = useGame()
  const { play } = useAudio()

  const { assignment, outcome, votedPlayerId } = state

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

  return (
    <div className="rise-in flex min-h-full flex-1 flex-col gap-6">
      <div
        className={`relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl px-5 py-10 text-center text-2xl font-extrabold shadow-lg ${
          crewWon
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-600/30'
            : 'bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950 shadow-amber-500/30'
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
        <span aria-hidden className="text-5xl drop-shadow-sm">
          {crewWon ? '🎉' : '🕵️'}
        </span>
        <span className="text-balance">
          {crewWon ? t('result.crewWins') : t('result.impostorWins')}
        </span>
      </div>

      <p className="text-center text-lg font-semibold text-slate-700 dark:text-slate-200">
        {outcome.votedWasImpostor
          ? t('result.isImpostor', { name: votedName })
          : t('result.notImpostor', { name: votedName })}
      </p>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-5 text-center shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            {t('result.theWordWas')}
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {outcome.word}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            {t('result.theImpostorsWere')}
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {impostorNames}
          </span>
        </div>
      </div>

      <Button size="lg" className="mt-auto w-full" onClick={() => dispatch({ type: 'PLAY_AGAIN' })}>
        {t('result.playAgain')}
      </Button>
    </div>
  )
}
