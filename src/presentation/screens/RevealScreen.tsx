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

  const otherImpostors = assignment.players.filter((p) => p.isImpostor && p.id !== current.id)
  const showOtherImpostors =
    config.impostorsSeeEachOther && assignment.impostorIds.length >= 2 && otherImpostors.length > 0

  // Back-face tone follows semantics: crew = emerald (positive), impostor = amber.
  const backTone = current.isImpostor
    ? 'border-amber-400/70 bg-gradient-to-br from-amber-50 to-amber-100 dark:border-amber-500/40 dark:from-amber-500/15 dark:to-amber-600/10'
    : 'border-emerald-400/70 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:border-emerald-500/40 dark:from-emerald-500/15 dark:to-emerald-600/10'

  return (
    <div className="rise-in flex min-h-full flex-1 flex-col gap-6">
      <p className="text-center text-base font-medium text-slate-500 dark:text-slate-400">
        {t('reveal.passTo', { name: current.name })}
      </p>

      <div className="flip-scene flex flex-1">
        <button
          type="button"
          data-testid="reveal-card"
          className={`flip-card relative flex w-full flex-1 select-none touch-none rounded-3xl outline-none transition-transform duration-150 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950 ${
            revealed ? 'is-flipped' : ''
          }`}
          aria-pressed={revealed}
          onPointerDown={show}
          onPointerUp={hide}
          onPointerLeave={hide}
          onPointerCancel={hide}
          onTouchStart={show}
          onTouchEnd={hide}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* FRONT FACE — large player name + hold prompt. Always mounted; no secret here. */}
          <span className="flip-face absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200/80 bg-white/85 p-6 text-center shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500 dark:text-brand-300">
              {t('reveal.holdToReveal')}
            </span>
            <span className="break-words text-5xl font-black leading-none tracking-tight text-slate-900 dark:text-slate-50">
              {current.name}
            </span>
            <span aria-hidden className="mt-1 text-4xl opacity-70">
              👆
            </span>
          </span>

          {/* BACK FACE — secret role. Content is conditionally rendered on `revealed`
              for privacy; the face shell flips into view in 3D. */}
          <span
            className={`flip-face flip-back absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border p-6 text-center shadow-lg ${backTone}`}
          >
            {revealed && !current.isImpostor && (
              <>
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-300">
                  {t('reveal.crew')}
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  {t('reveal.theWordIs')}
                </span>
                <span className="break-words text-4xl font-black leading-tight text-slate-900 dark:text-slate-50">
                  {assignment.word}
                </span>
              </>
            )}

            {revealed && current.isImpostor && (
              <>
                <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-300">
                  {t('reveal.impostor')}
                </span>
                {current.clue && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      {t('reveal.yourClue')}
                    </span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {current.clue}
                    </span>
                  </div>
                )}
                {showOtherImpostors && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      {t('reveal.otherImpostors')}
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {otherImpostors.map((p) => p.name).join(', ')}
                    </span>
                  </div>
                )}
              </>
            )}
          </span>
        </button>
      </div>

      <Button size="lg" className="w-full" onClick={next}>
        {t('reveal.next')}
      </Button>
    </div>
  )
}
