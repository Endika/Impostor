import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../state/useGame'
import { useAudio } from '../audio/useAudio'
import { Button } from '../components/Button'

export function RevealScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = useGame()
  const { play } = useAudio()
  const [revealed, setRevealed] = useState(false)

  const { assignment, revealIndex, config } = state
  if (!assignment || !config) return null

  const current = assignment.players[revealIndex]
  if (!current) return null

  function show() {
    if (!revealed) {
      try {
        play('reveal')
      } catch {
        // audio is best-effort; never block the reveal
      }
    }
    setRevealed(true)
  }

  function hide() {
    setRevealed(false)
  }

  function next() {
    setRevealed(false)
    dispatch({ type: 'NEXT_REVEAL' })
  }

  const otherImpostors = assignment.players.filter(
    (p) => p.isImpostor && p.id !== current.id,
  )
  const showOtherImpostors =
    config.impostorsSeeEachOther &&
    assignment.impostorIds.length >= 2 &&
    otherImpostors.length > 0

  const cardTone = revealed
    ? current.isImpostor
      ? 'border-amber-400 bg-amber-50 dark:border-amber-500/50 dark:bg-amber-500/10'
      : 'border-emerald-400 bg-emerald-50 dark:border-emerald-500/50 dark:bg-emerald-500/10'
    : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800'

  return (
    <div className="flex min-h-full flex-1 flex-col gap-6">
      <p className="text-center text-xl font-semibold text-slate-800 dark:text-slate-100">
        {t('reveal.passTo', { name: current.name })}
      </p>

      <button
        type="button"
        data-testid="reveal-card"
        className={`flex flex-1 select-none touch-none flex-col items-center justify-center gap-4 rounded-3xl border p-6 text-center shadow-sm transition-transform duration-150 active:scale-[0.98] active:shadow-lg ${cardTone}`}
        onPointerDown={show}
        onPointerUp={hide}
        onPointerLeave={hide}
        onPointerCancel={hide}
        onTouchStart={show}
        onTouchEnd={hide}
        onContextMenu={(e) => e.preventDefault()}
      >
        {!revealed && (
          <>
            <span aria-hidden className="text-5xl">
              👆
            </span>
            <span className="text-lg font-medium text-slate-500 dark:text-slate-300">
              {t('reveal.holdToReveal')}
            </span>
          </>
        )}

        {revealed && !current.isImpostor && (
          <>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">
              {t('reveal.crew')}
            </span>
            <span className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t('reveal.theWordIs')}
            </span>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">
              {assignment.word}
            </span>
          </>
        )}

        {revealed && current.isImpostor && (
          <>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-300">
              {t('reveal.impostor')}
            </span>
            {assignment.clue && (
              <div className="flex flex-col gap-1">
                <span className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t('reveal.yourClue')}
                </span>
                <span className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {t(`categories.${assignment.clue}`)}
                </span>
              </div>
            )}
            {showOtherImpostors && (
              <div className="flex flex-col gap-1">
                <span className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t('reveal.otherImpostors')}
                </span>
                <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {otherImpostors.map((p) => p.name).join(', ')}
                </span>
              </div>
            )}
          </>
        )}
      </button>

      <Button size="lg" className="w-full" onClick={next}>
        {t('reveal.next')}
      </Button>
    </div>
  )
}
