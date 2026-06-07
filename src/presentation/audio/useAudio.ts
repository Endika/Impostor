import { useCallback, useEffect, useState } from 'react'
import { AudioEngine, type LoopTrack, type Sfx } from './AudioEngine'

const MUTED_KEY = 'impostor.audio.muted'

type AudioCtor = typeof AudioContext

function resolveAudioContextCtor(): AudioCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    AudioContext?: AudioCtor
    webkitAudioContext?: AudioCtor
  }
  return w.AudioContext ?? w.webkitAudioContext ?? null
}

let singleton: AudioEngine | null = null

function getEngine(): AudioEngine | null {
  if (singleton) return singleton
  const Ctor = resolveAudioContextCtor()
  if (!Ctor) return null
  singleton = new AudioEngine(() => new Ctor())
  return singleton
}

function readPersistedMuted(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(MUTED_KEY) === 'true'
  } catch {
    return false
  }
}

export interface UseAudio {
  play(sfx: Sfx): void
  startLoop(track: LoopTrack): void
  stopLoop(): void
  muted: boolean
  toggleMuted(): void
}

export function useAudio(): UseAudio {
  const [muted, setMuted] = useState<boolean>(readPersistedMuted)

  useEffect(() => {
    getEngine()?.setMuted(muted)
  }, [muted])

  const play = useCallback((sfx: Sfx) => {
    getEngine()?.play(sfx)
  }, [])

  const startLoop = useCallback((track: LoopTrack) => {
    getEngine()?.startLoop(track)
  }, [])

  const stopLoop = useCallback(() => {
    getEngine()?.stopLoop()
  }, [])

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev
      const engine = getEngine()
      engine?.setMuted(next)
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(MUTED_KEY, String(next))
        } catch {
          // ignore persistence failures
        }
      }
      return next
    })
  }, [])

  return { play, startLoop, stopLoop, muted, toggleMuted }
}
