import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Assignment, Player } from '../../domain/game/types'
import { Button } from './Button'
import { useModalDialog } from './useModalDialog'
import { RoleCard } from './RoleCard'
import { roleCardFace } from './roleCardFace'

interface PeekCardProps {
  player: Player
  assignment: Assignment
  impostorsSeeEachOther: boolean
  onClose: () => void
}

/** Asks "Are you X?" first, so the card never opens in front of someone else. */
export function PeekCard({ player, assignment, impostorsSeeEachOther, onClose }: PeekCardProps) {
  const { t } = useTranslation()
  const [confirmed, setConfirmed] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const safeButton = useRef<HTMLButtonElement>(null)

  useModalDialog(dialog, true)

  useEffect(() => {
    safeButton.current?.focus()
  }, [confirmed])

  const title = t('round.peekConfirm', { name: player.name })

  return (
    <dialog
      ref={dialog}
      className="peek"
      aria-modal="true"
      aria-labelledby="peek-title"
      onClose={onClose}
    >
      <div className="flex max-h-full w-full max-w-md flex-col gap-5">
        {confirmed ? (
          <>
            <h2 id="peek-title" className="sr-only">
              {player.name}
            </h2>
            <RoleCard
              name={player.name}
              face={roleCardFace(player, assignment, impostorsSeeEachOther, t)}
            />
            <Button ref={safeButton} size="lg" className="w-full" onClick={onClose}>
              {t('round.peekDone')}
            </Button>
          </>
        ) : (
          <>
            <h2
              id="peek-title"
              className="text-center text-3xl font-extrabold text-balance [overflow-wrap:anywhere]"
            >
              {title}
            </h2>
            <Button size="lg" className="w-full" onClick={() => setConfirmed(true)}>
              {t('round.peekYes')}
            </Button>
            <Button ref={safeButton} variant="secondary" className="w-full" onClick={onClose}>
              {t('round.peekCancel')}
            </Button>
          </>
        )}
      </div>
    </dialog>
  )
}
