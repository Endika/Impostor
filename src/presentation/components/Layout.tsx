import type { ReactNode } from 'react'

/**
 * Shared app shell: full-height, centered, max-width container with comfortable
 * padding and no horizontal overflow at 320px. Children own their own vertical
 * rhythm via the inner flex column.
 */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-5 sm:px-6">
        {children}
      </div>
    </div>
  )
}
