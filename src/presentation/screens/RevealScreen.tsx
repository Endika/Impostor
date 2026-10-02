import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../state/useGame'
import { useAudio } from '../audio/useAudio'
import { Hand } from 'lucide-react'
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

  const others = showOtherImpostors ? otherImpostors.map((p) => p.name).join(', ') : null
  const back = !current.isImpostor
    ? { title: t('reveal.crew'), display: assignment.word, support: t('reveal.crewHint') }
    : {
        title: t('reveal.impostor'),
        display: current.clue ?? t('reveal.noClueWord'),
        support: [
          current.clue ? t('reveal.clueHint') : t('reveal.noClueHint'),
          others && t('reveal.withImpostors', { names: others }),
        ]
          .filter(Boolean)
          .join(' · '),
      }
  const last = revealIndex === assignment.players.length - 1

  return (
    <div className="flex flex-1 flex-col gap-5">
      <h1
        ref={heading}
        tabIndex={-1}
        className="text-center text-2xl font-extrabold text-balance [overflow-wrap:anywhere]"
      >
        {t('reveal.passTo', { name: current.name })}
      </h1>

      <div className="flip-scene flex min-h-[22rem] flex-1">
        <button
          type="button"
          data-testid="reveal-card"
          className={`flip-card relative flex w-full flex-1 touch-none rounded-3xl select-none focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ground ${
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
          {/* FRONT FACE: the player's name and the hold prompt. No secret here. */}
          <span className="flip-face flip-front absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-3xl border-2 border-line bg-surface p-6 text-center shadow-card">
            <Hand aria-hidden size={44} strokeWidth={2} className="text-muted" />
            <span className="text-5xl leading-none font-extrabold tracking-tight text-balance [overflow-wrap:anywhere]">
              {current.name}
            </span>
            <span className="text-lg font-medium text-muted">{t('reveal.holdToReveal')}</span>
          </span>

          {/* BACK FACE: one neutral card with one silhouette for every role
              (title, one display line, one supporting line), so nobody can
              read the role from across the table. Content exists only while
              held. */}
          <span className="flip-face flip-back absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-3xl border-2 border-line bg-raised p-6 text-center shadow-card">
            {revealed && (
              <>
                <span className="text-3xl font-extrabold">{back.title}</span>
                <span className="text-5xl leading-tight font-extrabold tracking-tight text-balance [overflow-wrap:anywhere]">
                  {back.display}
                </span>
                <span className="text-lg text-muted text-balance [overflow-wrap:anywhere]">
                  {back.support}
                </span>
              </>
            )}
          </span>
        </button>
      </div>

      <p aria-live="polite" className="sr-only">
        {revealed && `${back.title}. ${back.display}. ${back.support}`}
      </p>

      <Button size="lg" className="w-full" disabled={!seen} onClick={next}>
        {last ? t('reveal.startDebate') : t('reveal.next')}
      </Button>
    </div>
  )
}
