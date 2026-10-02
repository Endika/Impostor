import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LogOut } from 'lucide-react'
import { useGame } from '../state/useGame'
import { isInProgress } from '../state/gamePersistence'
import { ConfirmButton } from './ConfirmButton'
import { MaskMark } from './Wordmark'

// Vite replaces __APP_VERSION__ at build time; under vitest the define isn't
// applied, so fall back to a placeholder to render gracefully.
const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'

/** App shell: one centred column, safe-area aware, no horizontal overflow at 320px. */
export function Layout({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { state, dispatch } = useGame()
  const inGame = isInProgress(state)
  return (
    <div className="min-h-dvh w-full bg-ground text-ink">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))]">
        <header className="mb-5 flex min-h-11 items-center justify-between gap-3 select-none">
          <span className="flex items-center gap-2.5">
            <MaskMark />
            <span className="text-xl font-extrabold tracking-tight">{t('common.appName')}</span>
          </span>
          {inGame && (
            <ConfirmButton
              variant="ghost"
              size="sm"
              armedLabel={t('common.leaveConfirm')}
              onConfirm={() => dispatch({ type: 'LEAVE_GAME' })}
            >
              <LogOut aria-hidden size={18} strokeWidth={2.5} />
              {t('common.leave')}
            </ConfirmButton>
          )}
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="mt-6 text-center text-xs text-muted select-none">
          {t('common.appName')} v{appVersion}
        </footer>
      </div>
    </div>
  )
}
