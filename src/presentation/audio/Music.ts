import type { LoopTrack } from './AudioEngine'

// Generative background music: a fixed harmonic frame (A minor) with a melody
// that is re-improvised on every pass, so a long debate never hears the same
// bar twice. Notes are scheduled ahead on the audio clock by a short timer
// (the "lookahead" pattern), which keeps timing tight even if the timer jitters.

const TICK_MS = 25
const LOOKAHEAD_S = 0.12
const STEPS_PER_BAR = 8 // eighth notes in 4/4

const midiToFreq = (midi: number): number => 440 * 2 ** ((midi - 69) / 12)

// Chord tones as MIDI numbers in the pad register.
const CHORDS: Record<string, number[]> = {
  Am: [57, 60, 64],
  F: [53, 57, 60],
  C: [55, 60, 64],
  G: [55, 59, 62],
  Dm: [57, 62, 65],
  E: [56, 59, 64],
}

const BASS_ROOT: Record<string, number> = { Am: 45, F: 41, C: 48, G: 43, Dm: 50, E: 40 }

// Every 8-bar cycle draws one of these; all end on E so the loop resolves home.
const PROGRESSIONS: string[][] = [
  ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E'],
  ['Am', 'Dm', 'F', 'E', 'Am', 'C', 'G', 'E'],
  ['Am', 'G', 'F', 'G', 'Am', 'F', 'Dm', 'E'],
  ['F', 'G', 'Am', 'Am', 'F', 'C', 'Dm', 'E'],
]

// A minor pentatonic across the melody register.
const SCALE = [64, 67, 69, 72, 74, 76, 79, 81, 84]

interface TrackFeel {
  bpm: number
  density: number // chance of a melody note on a free step
  pulse: boolean // bass on every eighth
}

const FEEL: Record<LoopTrack, TrackFeel> = {
  calm: { bpm: 88, density: 0.42, pulse: false },
  tense: { bpm: 118, density: 0.6, pulse: true },
}

export class Music {
  private readonly master: GainNode
  private timer: ReturnType<typeof setInterval> | null = null
  private nextTime = 0
  private step = 0 // absolute eighth-note counter
  private progression: string[] = PROGRESSIONS[0]!
  private melodyIndex = 3
  private melodyWave: OscillatorType = 'triangle'
  private holdUntilStep = -1

  constructor(
    private readonly ctx: AudioContext,
    private track: LoopTrack,
    private readonly rng: () => number,
  ) {
    this.master = ctx.createGain()
    this.master.gain.setValueAtTime(0.0001, ctx.currentTime)
    this.master.connect(ctx.destination)
  }

  start(): void {
    const now = this.ctx.currentTime
    this.master.gain.linearRampToValueAtTime(1, now + 2)
    this.nextTime = now + 0.1
    this.timer = setInterval(() => this.tick(), TICK_MS)
    this.tick()
  }

  setTrack(track: LoopTrack): void {
    this.track = track
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer)
      this.timer = null
    }
    const now = this.ctx.currentTime
    try {
      this.master.gain.setValueAtTime(this.master.gain.value, now)
      this.master.gain.linearRampToValueAtTime(0.0001, now + 0.6)
    } catch {
      // ignore
    }
    setTimeout(() => {
      try {
        this.master.disconnect()
      } catch {
        // already disconnected
      }
    }, 700)
  }

  private tick(): void {
    while (this.nextTime < this.ctx.currentTime + LOOKAHEAD_S) {
      this.scheduleStep(this.step, this.nextTime)
      this.nextTime += 60 / FEEL[this.track].bpm / 2
      this.step += 1
    }
  }

  private pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.rng() * items.length)]!
  }

  private scheduleStep(step: number, time: number): void {
    const feel = FEEL[this.track]
    const eighth = 60 / feel.bpm / 2
    const barInCycle = Math.floor(step / STEPS_PER_BAR) % 8
    const s = step % STEPS_PER_BAR

    if (barInCycle === 0 && s === 0) {
      this.progression = this.pick(PROGRESSIONS)
      this.melodyWave = this.rng() < 0.5 ? 'triangle' : 'sine'
    }
    const chordName = this.progression[barInCycle]!
    const chord = CHORDS[chordName]!
    const root = BASS_ROOT[chordName]!

    // Pad: the chord held across the bar, voiced differently each time.
    if (s === 0) {
      const lift = Math.floor(this.rng() * chord.length)
      chord.forEach((note, i) => {
        const midi = i < lift ? note + 12 : note
        this.voice(midiToFreq(midi), time, eighth * STEPS_PER_BAR, 'sine', 0.018)
      })
    }

    // Bass: beats 1 and 3, sometimes a fifth; the tense feel pulses every eighth.
    if (feel.pulse) {
      const octave = s % 2 === 0 ? 0 : 12
      this.voice(midiToFreq(root + octave), time, eighth * 0.8, 'triangle', 0.06)
    } else if (s === 0 || s === 4) {
      const fifth = s === 4 && this.rng() < 0.3 ? 7 : 0
      this.voice(midiToFreq(root + fifth), time, eighth * 3.5, 'triangle', 0.07)
    }

    this.scheduleMelody(step, s, barInCycle, chord, time, eighth, feel.density)
  }

  private scheduleMelody(
    step: number,
    s: number,
    barInCycle: number,
    chord: number[],
    time: number,
    eighth: number,
    density: number,
  ): void {
    if (step < this.holdUntilStep) return
    // Phrases breathe: the second half of bars 4 and 8 rests.
    const breath = (barInCycle === 3 || barInCycle === 7) && s >= 4
    if (breath) return

    const strong = s === 0 || s === 4
    if (!strong && this.rng() > density) return
    if (strong && this.rng() > Math.min(1, density + 0.35)) return

    if (barInCycle === 7 && s === 0) {
      this.melodyIndex = this.pick([2, 7]) // land on A to close the cycle
    } else if (strong) {
      // Strong beats lean on the chord: nearest scale tone that is a chord tone.
      const pitchClasses = chord.map((n) => n % 12)
      const candidates = SCALE.map((n, i) => ({ n, i })).filter(({ n }) =>
        pitchClasses.includes(n % 12),
      )
      if (candidates.length > 0) {
        const nearest = candidates.reduce((best, c) =>
          Math.abs(c.i - this.melodyIndex) < Math.abs(best.i - this.melodyIndex) ? c : best,
        )
        this.melodyIndex = nearest.i
      }
    } else {
      const leap = this.rng() < 0.08 ? this.pick([-3, 3]) : this.pick([-2, -1, -1, 1, 1, 2])
      this.melodyIndex = Math.min(SCALE.length - 1, Math.max(0, this.melodyIndex + leap))
    }

    const long = this.rng() < 0.3
    const length = long ? 2 : 1
    this.holdUntilStep = step + length
    this.voice(
      midiToFreq(SCALE[this.melodyIndex]!),
      time,
      eighth * length * 0.9,
      this.melodyWave,
      0.05,
    )
  }

  private voice(
    freq: number,
    time: number,
    duration: number,
    type: OscillatorType,
    peak: number,
  ): void {
    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, time)
      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.linearRampToValueAtTime(peak, time + Math.min(0.04, duration / 4))
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration)
      osc.connect(gain)
      gain.connect(this.master)
      osc.onended = () => {
        osc.disconnect()
        gain.disconnect()
      }
      osc.start(time)
      osc.stop(time + duration + 0.02)
    } catch {
      // audio is best-effort
    }
  }
}
