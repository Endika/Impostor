import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Shared app shell: full-height, centered, max-width container with comfortable
 * padding and no horizontal overflow at 320px. An ambient gradient + grain
 * background sits behind everything (.app-bg / .app-grain), and a slim wordmark
 * header gives the app identity. Children own their own vertical rhythm.
 */
export function Layout({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className="app-bg app-grain min-h-dvh w-full text-slate-900 dark:text-slate-100">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-6 pt-4 sm:px-6">
        <header className="mb-4 flex items-center justify-center gap-2 select-none">
          <span
            aria-hidden
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-sm shadow-sm"
          >
            🕵️
          </span>
          <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-base font-extrabold tracking-tight text-transparent dark:from-brand-300 dark:to-accent-400">
            {t('common.appName')}
          </span>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  )
}
