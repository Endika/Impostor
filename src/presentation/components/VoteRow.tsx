import { Minus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface VoteRowProps {
  name: string
  votes: number
  canAdd: boolean
  onAdd: () => void
  onRemove: () => void
}

/** The add target and the minus button are siblings so a minus tap never counts as a row tap. */
export function VoteRow({ name, votes, canAdd, onAdd, onRemove }: VoteRowProps) {
  const { t } = useTranslation()
  return (
    <div className="flex items-stretch gap-2">
      <button
        type="button"
        aria-label={t('vote.rowLabel', { name, count: votes })}
        aria-disabled={!canAdd}
        onClick={onAdd}
        className={
          'flex min-h-14 min-w-0 flex-1 items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 ' +
          'text-left text-lg font-bold transition-[border-color,background-color] duration-150 ' +
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/70 ' +
          (votes > 0 ? 'border-ink bg-raised ' : 'border-line bg-surface ') +
          (canAdd ? 'text-ink hover:border-line-strong' : 'cursor-not-allowed text-muted')
        }
      >
        <span className="min-w-0 [overflow-wrap:anywhere]">{name}</span>
        {votes > 0 && (
          <span aria-hidden className="flex max-w-1/2 shrink-0 items-center gap-2">
            <span className="flex flex-wrap justify-end gap-1">
              {Array.from({ length: votes }, (_, i) => (
                <span key={i} className="h-3 w-3 rounded-full bg-ink" />
              ))}
            </span>
            <span className="text-xl tabular-nums">{votes}</span>
          </span>
        )}
      </button>
      {votes > 0 && (
        <button
          type="button"
          aria-label={t('vote.remove', { name })}
          onClick={onRemove}
          className="flex w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-line bg-raised text-ink hover:border-line-strong focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ink"
        >
          <Minus size={22} strokeWidth={3} aria-hidden />
        </button>
      )}
    </div>
  )
}
