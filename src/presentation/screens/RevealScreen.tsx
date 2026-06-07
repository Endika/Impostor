import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../state/useGame'
import { useAudio } from '../audio/useAudio'

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

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 p-4">
      <p className="text-center text-xl font-semibold text-slate-100">
        {t('reveal.passTo', { name: current.name })}
      </p>

      <button
        type="button"
        data-testid="reveal-card"
        className="flex flex-1 select-none flex-col items-center justify-center gap-4 rounded-2xl border border-slate-600 bg-slate-800 p-6 text-center"
        onPointerDown={show}
        onPointerUp={hide}
        onPointerLeave={hide}
        onPointerCancel={hide}
        onTouchStart={show}
        onTouchEnd={hide}
        onContextMenu={(e) => e.preventDefault()}
      >
        {!revealed && (
          <span className="text-lg text-slate-300">{t('reveal.holdToReveal')}</span>
        )}

        {revealed && !current.isImpostor && (
          <>
            <span className="text-2xl font-bold text-emerald-300">
              {t('reveal.crew')}
            </span>
            <span className="text-sm uppercase tracking-wide text-slate-400">
              {t('reveal.theWordIs')}
            </span>
            <span className="text-3xl font-extrabold text-slate-100">
              {assignment.word}
            </span>
          </>
        )}

        {revealed && current.isImpostor && (
          <>
            <span className="text-2xl font-bold text-amber-300">
              {t('reveal.impostor')}
            </span>
            {assignment.clue && (
              <div className="flex flex-col gap-1">
                <span className="text-sm uppercase tracking-wide text-slate-400">
                  {t('reveal.yourClue')}
                </span>
                <span className="text-xl font-semibold text-slate-100">
                  {t(`categories.${assignment.clue}`)}
                </span>
              </div>
            )}
            {showOtherImpostors && (
              <div className="flex flex-col gap-1">
                <span className="text-sm uppercase tracking-wide text-slate-400">
                  {t('reveal.otherImpostors')}
                </span>
                <span className="text-lg font-semibold text-slate-100">
                  {otherImpostors.map((p) => p.name).join(', ')}
                </span>
              </div>
            )}
          </>
        )}
      </button>

      <button
        type="button"
        className="rounded-xl bg-indigo-500 px-4 py-3 text-lg font-semibold text-white"
        onClick={next}
      >
        {t('reveal.next')}
      </button>
    </div>
  )
}
