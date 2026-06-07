export type Sfx = 'reveal' | 'vote' | 'victoryCrew' | 'victoryImpostor'
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
}

const LOOP_TRACKS: Record<LoopTrack, { notes: number[]; step: number; type: OscillatorType }> = {
  calm: { notes: [261.63, 329.63, 392.0, 329.63], step: 0.4, type: 'sine' },
  tense: { notes: [220.0, 233.08, 220.0, 207.65], step: 0.28, type: 'triangle' },
}

export class AudioEngine {
  private ctx: AudioContext | null = null
  private _muted = false
  private loopTimer: ReturnType<typeof setInterval> | null = null
  private loopNodes: { osc: OscillatorNode; gain: GainNode }[] = []

  constructor(private readonly ctxFactory: () => AudioContext) {}

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

  startLoop(track: LoopTrack): void {
    if (this._muted) return
    const ctx = this.getCtx()
    if (!ctx) return
    this.stopLoop()
    const cfg = LOOP_TRACKS[track]
    const scheduleBar = () => {
      const now = ctx.currentTime
      cfg.notes.forEach((freq, i) => {
        const nodes = this.scheduleNote(
          ctx,
          {
            freq,
            start: i * cfg.step,
            duration: cfg.step * 0.9,
            type: cfg.type,
            gain: 0.06,
          },
          now,
        )
        if (nodes) this.loopNodes.push(nodes)
      })
    }
    scheduleBar()
    const barLength = cfg.notes.length * cfg.step
    this.loopTimer = setInterval(scheduleBar, barLength * 1000)
  }

  stopLoop(): void {
    if (this.loopTimer !== null) {
      clearInterval(this.loopTimer)
      this.loopTimer = null
    }
    for (const { osc, gain } of this.loopNodes) {
      try {
        osc.stop()
      } catch {
        // already stopped
      }
      try {
        osc.disconnect()
        gain.disconnect()
      } catch {
        // already disconnected
      }
    }
    this.loopNodes = []
  }

  private scheduleNote(
    ctx: AudioContext,
    note: Note,
    now: number,
  ): { osc: OscillatorNode; gain: GainNode } | null {
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
      osc.start(now + note.start)
      osc.stop(now + note.start + note.duration + 0.02)
      return { osc, gain }
    } catch {
      return null
    }
  }
}
