import { useEffect, useState, type ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'

const DISARM_AFTER_MS = 4000

type ConfirmButtonProps = Omit<ComponentProps<typeof Button>, 'onClick'> & {
  onConfirm: () => void
  armedLabel?: string
}

/** A button for irreversible actions: the first tap arms it, the second runs it. */
export function ConfirmButton({ onConfirm, armedLabel, children, ...rest }: ConfirmButtonProps) {
  const { t } = useTranslation()
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), DISARM_AFTER_MS)
    return () => clearTimeout(timer)
  }, [armed])

  return (
    <Button
      {...rest}
      aria-live="polite"
      onClick={() => {
        if (armed) {
          setArmed(false)
          onConfirm()
        } else {
          setArmed(true)
        }
      }}
    >
      {armed ? (armedLabel ?? t('common.confirmAgain')) : children}
    </Button>
  )
}
