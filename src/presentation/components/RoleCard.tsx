import { useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Hand } from 'lucide-react'
import type { RoleCardFace } from './roleCardFace'

interface RoleCardProps {
  name: string
  face: RoleCardFace
  onReveal?: () => void
}

function isRevealKey(e: KeyboardEvent<HTMLButtonElement>) {
  return e.key === ' ' || e.key === 'Enter'
}

/** A card that shows its back only while held (pointer or Space/Enter). */
export function RoleCard({ name, face, onReveal }: RoleCardProps) {
  const { t } = useTranslation()
  const [revealed, setRevealed] = useState(false)

  function show() {
    if (!revealed) onReveal?.()
    setRevealed(true)
  }

  function hide() {
    setRevealed(false)
  }

  return (
    <>
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
              {name}
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
                <span className="text-3xl font-extrabold">{face.title}</span>
                <span className="text-5xl leading-tight font-extrabold tracking-tight text-balance [overflow-wrap:anywhere]">
                  {face.display}
                </span>
                <span className="text-lg text-muted text-balance [overflow-wrap:anywhere]">
                  {face.support}
                </span>
              </>
            )}
          </span>
        </button>
      </div>

      <p aria-live="polite" className="sr-only">
        {revealed && `${face.title}. ${face.display}. ${face.support}`}
      </p>
    </>
  )
}
