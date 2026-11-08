import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../state/useGame'
import { useAudio } from '../audio/useAudio'
import { Button } from '../components/Button'
import { RoleCard } from '../components/RoleCard'
import { roleCardFace } from '../components/roleCardFace'

export function RevealScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = useGame()
  const { play } = useAudio()
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

  function onReveal() {
    try {
      play('reveal')
    } catch {
      // audio is best-effort; never block the reveal
    }
    setSeen(true)
  }

  function next() {
    setSeen(false)
    dispatch({ type: 'NEXT_REVEAL' })
  }

  const face = roleCardFace(current, assignment, config.impostorsSeeEachOther, t)
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

      <RoleCard key={current.id} name={current.name} face={face} onReveal={onReveal} />

      <Button size="lg" className="w-full" disabled={!seen} onClick={next}>
        {last ? t('reveal.startDebate') : t('reveal.next')}
      </Button>
    </div>
  )
}
