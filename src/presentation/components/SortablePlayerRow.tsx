import type { ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface SortablePlayerRowProps {
  id: string
  gripLabel: string
  children: ReactNode
  trailing?: ReactNode
}

export function SortablePlayerRow({ id, gripLabel, children, trailing }: SortablePlayerRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`relative flex items-center gap-2 rounded-2xl bg-ground ${
        isDragging ? 'z-10 opacity-80 shadow-press' : ''
      }`}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        aria-label={gripLabel}
        className="flex h-12 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-2xl text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ink"
        {...attributes}
        {...listeners}
      >
        <GripVertical aria-hidden size={22} strokeWidth={2.5} />
      </button>
      {children}
      {trailing}
    </li>
  )
}
