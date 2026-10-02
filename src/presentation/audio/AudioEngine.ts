import { Music } from './Music'

export type Sfx = 'reveal' | 'vote' | 'victoryCrew' | 'victoryImpostor' | 'timeUp'
export type LoopTrack = 'calm' | 'tense'

interface Note {
  freq: number
  start: number // seconds offset from now
  duration: number
  type?: OscillatorType
  gain?: number
}

const SFX_NOTES: Record<Sfx, Note[]> = {
  reveal: [
    { freq: 523.25, start: 0, duration: 0.12 },
    { freq: 783.99, start: 0.1, duration: 0.18 },
  ],
  vote: [
    { freq: 349.23, start: 0, duration: 0.08, type: 'square', gain: 0.15 },
    { freq: 261.63, start: 0.07, duration: 0.12, type: 'square', gain: 0.15 },
  ],
  victoryCrew: [
    { freq: 523.25, start: 0, duration: 0.14 },
    { freq: 659.25, start: 0.13, duration: 0.14 },
    { freq: 783.99, start: 0.26, duration: 0.14 },
    { freq: 1046.5, start: 0.39, duration: 0.28 },
  ],
  victoryImpostor: [
    { freq: 392.0, start: 0, duration: 0.16, type: 'sawtooth', gain: 0.18 },
    { freq: 311.13, start: 0.15, duration: 0.16, type: 'sawtooth', gain: 0.18 },
    { freq: 233.08, start: 0.3, duration: 0.34, type: 'sawtooth', gain: 0.18 },
  ],
  timeUp: [
    { freq: 880, start: 0, duration: 0.12, type: 'square', gain: 0.12 },
    { freq: 880, start: 0.2, duration: 0.12, type: 'square', gain: 0.12 },
    { freq: 659.25, start: 0.4, duration: 0.3, type: 'square', gain: 0.12 },
  ],
}

export class AudioEngine {
  private ctx: AudioContext | null = null
  private _muted = false
  private music: Music | null = null

  constructor(
    private readonly ctxFactory: () => AudioContext,
    private readonly rng: () => number = Math.random,
  ) {}

  get muted(): boolean {
    return this._muted
  }

  private getCtx(): AudioContext | null {
    if (!this.ctx) {
      try {
        this.ctx = this.ctxFactory()
      } catch {
        this.ctx = null
      }
    }
    // Browsers start or park the context suspended (autoplay rules, iOS calls
    // and backgrounding); without a resume every later sound stays silent.
    if (this.ctx && this.ctx.state !== 'running') {
      void this.ctx.resume?.().catch(() => undefined)
    }
    return this.ctx
  }

  setMuted(muted: boolean): void {
    this._muted = muted
    if (muted) this.stopLoop()
  }

  play(sfx: Sfx): void {
    if (this._muted) return
    const ctx = this.getCtx()
    if (!ctx) return
    const now = ctx.currentTime
    for (const note of SFX_NOTES[sfx]) {
      this.scheduleNote(ctx, note, now)
    }
  }

  /** Starts the background music, or moves the running music to another mood. */
  startLoop(track: LoopTrack): void {
    if (this._muted) return
    if (this.music) {
      this.music.setTrack(track)
      return
    }
    const ctx = this.getCtx()
    if (!ctx) return
    try {
      this.music = new Music(ctx, track, this.rng)
      this.music.start()
    } catch {
      this.music = null
    }
  }

  stopLoop(): void {
    this.music?.stop()
    this.music = null
  }

  private scheduleNote(ctx: AudioContext, note: Note, now: number): void {
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = note.type ?? 'sine'
      osc.frequency.setValueAtTime(note.freq, now + note.start)
      const peak = note.gain ?? 0.2
      gain.gain.setValueAtTime(0.0001, now + note.start)
      gain.gain.linearRampToValueAtTime(peak, now + note.start + 0.01)
      gain.gain.linearRampToValueAtTime(0.0001, now + note.start + note.duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.onended = () => {
        osc.disconnect()
        gain.disconnect()
      }
      osc.start(now + note.start)
      osc.stop(now + note.start + note.duration + 0.02)
    } catch {
      // audio is best-effort
    }
  }
}
