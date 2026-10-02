import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../state/useGame'
import { useAudio } from '../audio/useAudio'
import { Button } from '../components/Button'

export function RevealScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = useGame()
  const { play } = useAudio()
  const [revealed, setRevealed] = useState(false)
  const [seen, setSeen] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const firstPlayer = useRef(true)

  // Next re-locks itself for the new player, so hand focus to the new
  // "pass the phone" heading instead of leaving it on a disabled button.
  useEffect(() => {
    if (firstPlayer.current) {
      firstPlayer.current = false
      return
    }
    heading.current?.focus()
  }, [state.revealIndex])

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
    setSeen(true)
  }

  function hide() {
    setRevealed(false)
  }

  function next() {
    setRevealed(false)
    setSeen(false)
    dispatch({ type: 'NEXT_REVEAL' })
  }

  function isRevealKey(e: KeyboardEvent<HTMLButtonElement>) {
    return e.key === ' ' || e.key === 'Enter'
  }

  const otherImpostors = assignment.players.filter((p) => p.isImpostor && p.id !== current.id)
  const showOtherImpostors =
    config.impostorsSeeEachOther && assignment.impostorIds.length >= 2 && otherImpostors.length > 0

  // Both roles share one back face so nobody can read the role from across the
  // table; only the text on it differs.
  const backTone = 'border-slate-300/80 bg-white dark:border-slate-600 dark:bg-slate-800'

  return (
    <div className="rise-in flex min-h-full flex-1 flex-col gap-6">
      <h1
        ref={heading}
        tabIndex={-1}
        className="text-center text-base font-medium text-slate-500 dark:text-slate-400"
      >
        {t('reveal.passTo', { name: current.name })}
      </h1>

      <div className="flip-scene flex flex-1">
        <button
          type="button"
          data-testid="reveal-card"
          className={`flip-card relative flex w-full flex-1 select-none touch-none rounded-3xl outline-none transition-transform duration-150 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950 ${
            revealed ? 'is-flipped' : ''
          }`}
          onPointerDown={show}
          onPointerUp={hide}
          onPointerLeave={hide}
          onPointerCancel={hide}
          onKeyDown={(e) => {
            if (!isRevealKey(e)) return
            e.preventDefault()
            if (!e.repeat) show()
          }}
          onKeyUp={(e) => {
            if (!isRevealKey(e)) return
            e.preventDefault()
            hide()
          }}
          onBlur={hide}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* FRONT FACE — large player name + hold prompt. Always mounted; no secret here. */}
          <span className="flip-face flip-front absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200/80 bg-white/85 p-6 text-center shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70">
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
                <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
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
                <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
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

      <p aria-live="polite" className="sr-only">
        {revealed &&
          (current.isImpostor
            ? [t('reveal.impostor'), current.clue && `${t('reveal.yourClue')}: ${current.clue}`]
                .filter(Boolean)
                .join('. ')
            : `${t('reveal.crew')}. ${t('reveal.theWordIs')}: ${assignment.word}`)}
      </p>

      <Button size="lg" className="w-full" disabled={!seen} onClick={next}>
        {revealIndex === assignment.players.length - 1 ? t('reveal.startDebate') : t('reveal.next')}
      </Button>
    </div>
  )
}
