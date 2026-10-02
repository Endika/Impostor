import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  closeLabel: string
  children: ReactNode
}

/** A bottom sheet on the native <dialog>: focus trap, Esc and backdrop for free. */
export function Sheet({ open, onClose, title, closeLabel, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close()
      else dialog.removeAttribute('open')
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex max-h-[85dvh] flex-col gap-4 overflow-y-auto rounded-t-3xl border-2 border-b-0 border-line bg-surface px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold">{title}</h2>
          <button
            type="button"
            aria-label={closeLabel}
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-raised hover:text-ink focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/70"
            onClick={onClose}
          >
            <X aria-hidden size={24} strokeWidth={2.5} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
