import { useTranslation } from 'react-i18next'
import { Sheet } from './Sheet'

const RULES = ['rules.word', 'rules.clues', 'rules.vote', 'rules.win', 'rules.guess'] as const

export function RulesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <Sheet open={open} onClose={onClose} title={t('rules.title')} closeLabel={t('common.close')}>
      <ol className="flex list-none flex-col gap-4 pb-2">
        {RULES.map((key, i) => (
          <li key={key} className="flex gap-3 text-lg leading-snug">
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-raised text-base font-extrabold text-ink"
            >
              {i + 1}
            </span>
            <span>{t(key)}</span>
          </li>
        ))}
      </ol>
    </Sheet>
  )
}
