import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../state/useGame'
import { Button } from '../components/Button'

export function GuessScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = useGame()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const assignment = state.assignment
  if (!assignment) return null

  const alivePlayers = assignment.players.filter((p) => !state.eliminatedIds.includes(p.id))

  return (
    <div className="rise-in flex min-h-full flex-1 flex-col gap-6">
      <h1 className="text-center text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
        {t('guess.title')}
      </h1>

      <p className="text-center text-base font-semibold text-slate-600 dark:text-slate-300">
        {selectedId ? t('guess.prompt') : t('guess.who')}
      </p>

      {!selectedId ? (
        <div className="flex flex-1 flex-col gap-3">
          {alivePlayers.map((player) => (
            <button
              key={player.id}
              type="button"
              className="flex min-h-13 items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-lg font-bold text-slate-800 shadow-sm backdrop-blur-sm transition-all hover:bg-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-800/70 dark:focus-visible:ring-offset-slate-950"
              onClick={() => setSelectedId(player.id)}
            >
              <span className="min-w-0 break-words">{player.name}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-center gap-3">
          <Button
            variant="success"
            size="lg"
            className="w-full"
            onClick={() => dispatch({ type: 'IMPOSTOR_GUESSED_RIGHT' })}
          >
            {t('guess.correct')}
          </Button>
          <Button
            variant="danger"
            size="lg"
            className="w-full"
            onClick={() => dispatch({ type: 'GUESS_FAILED', playerId: selectedId })}
          >
            {t('guess.wrong')}
          </Button>
        </div>
      )}

      <Button
        variant="ghost"
        size="lg"
        className="mt-auto w-full"
        onClick={() => dispatch({ type: 'CANCEL_GUESS' })}
      >
        {t('guess.cancel')}
      </Button>
    </div>
  )
}
