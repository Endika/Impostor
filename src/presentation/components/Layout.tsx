import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../state/useGame'
import { isInProgress } from '../state/gamePersistence'
import { ConfirmButton } from './ConfirmButton'

/**
 * Shared app shell: full-height, centered, max-width container with comfortable
 * padding and no horizontal overflow at 320px. An ambient gradient + grain
 * background sits behind everything (.app-bg / .app-grain), and a slim wordmark
 * header gives the app identity. Children own their own vertical rhythm.
 */
// Vite replaces __APP_VERSION__ at build time; under vitest the define isn't
// applied, so fall back to a placeholder to render gracefully.
const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'

export function Layout({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { state, dispatch } = useGame()
  const inGame = isInProgress(state)
  return (
    <div className="app-bg app-grain min-h-dvh w-full text-slate-900 dark:text-slate-100">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-6 pt-4 sm:px-6">
        <header className="mb-4 flex min-h-11 items-center justify-between gap-2 select-none">
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-sm shadow-sm"
            >
              🕵️
            </span>
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-base font-extrabold tracking-tight text-transparent dark:from-brand-300 dark:to-accent-400">
              {t('common.appName')}
            </span>
          </span>
          {inGame && (
            <ConfirmButton
              variant="ghost"
              className="shrink-0 px-3 text-sm"
              armedLabel={t('common.leaveConfirm')}
              onConfirm={() => dispatch({ type: 'LEAVE_GAME' })}
            >
              {t('common.leave')}
            </ConfirmButton>
          )}
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="mt-6 select-none text-center text-xs text-slate-400 dark:text-slate-600">
          {t('common.appName')} v{appVersion}
        </footer>
      </div>
    </div>
  )
}
