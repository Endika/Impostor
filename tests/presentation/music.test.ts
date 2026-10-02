import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AudioEngine } from '../../src/presentation/audio/AudioEngine'

interface FakeOsc {
  freq: number
  startAt: number
  stopAt: number
  connected: boolean
  ended: boolean
  onended: (() => void) | null
}

// An AudioContext stand-in with a clock we drive by hand: oscillators record
// what they would play and fire `onended` once the clock passes their stop.
function clockedCtx(state: AudioContextState = 'running') {
  const oscs: FakeOsc[] = []
  const resumes: number[] = []
  const param = () => ({
    value: 1,
    setValueAtTime() {},
    linearRampToValueAtTime() {},
    exponentialRampToValueAtTime() {},
  })
  const ctx = {
    currentTime: 0,
    state,
    destination: {},
    resume() {
      resumes.push(ctx.currentTime)
      ctx.state = 'running'
      return Promise.resolve()
    },
    createGain: () => ({ gain: param(), connect() {}, disconnect() {} }),
    createOscillator: () => {
      const osc: FakeOsc & Record<string, unknown> = {
        freq: 0,
        startAt: 0,
        stopAt: Infinity,
        connected: false,
        ended: false,
        onended: null,
        type: 'sine',
        frequency: {
          setValueAtTime(v: number) {
            osc.freq = v
          },
        },
        connect() {
          osc.connected = true
        },
        disconnect() {
          osc.connected = false
        },
        start(t: number) {
          osc.startAt = t
        },
        stop(t: number) {
          osc.stopAt = t
        },
      }
      oscs.push(osc)
      return osc
    },
  }
  function advance(seconds: number) {
    const steps = Math.round(seconds / 0.025)
    for (let i = 0; i < steps; i++) {
      ctx.currentTime += 0.025
      vi.advanceTimersByTime(25)
      for (const o of oscs) {
        if (!o.ended && o.stopAt <= ctx.currentTime) {
          o.ended = true
          o.onended?.()
        }
      }
    }
  }
  return { ctx: ctx as unknown as AudioContext, oscs, resumes, advance }
}

function seededRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32
    return s / 2 ** 32
  }
}

describe('background music', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('never repeats an 8-bar pass over two minutes', () => {
    const f = clockedCtx()
    const engine = new AudioEngine(() => f.ctx, seededRng(7))
    engine.startLoop('calm')
    f.advance(120)
    engine.stopLoop()

    // 88 bpm, 8 bars of 4 beats per pass.
    const pass = (60 / 88) * 4 * 8
    const passes = new Map<number, string[]>()
    for (const o of f.oscs) {
      const n = Math.floor((o.startAt - 0.1) / pass)
      const offset = Math.round(((o.startAt - 0.1) % pass) * 100)
      passes.set(n, [...(passes.get(n) ?? []), `${o.freq.toFixed(1)}@${offset}`])
    }
    const full = [...passes.entries()].filter(([n]) => (n + 1) * pass < 120).map(([, v]) => v)
    expect(full.length).toBeGreaterThanOrEqual(4)
    const fingerprints = full.map((notes) => [...notes].sort().join(','))
    expect(new Set(fingerprints).size).toBe(fingerprints.length)
  })

  it('keeps the number of live voices bounded', () => {
    const f = clockedCtx()
    const engine = new AudioEngine(() => f.ctx, seededRng(3))
    engine.startLoop('tense')
    let maxLive = 0
    for (let i = 0; i < 120; i++) {
      f.advance(1)
      maxLive = Math.max(maxLive, f.oscs.filter((o) => o.connected).length)
    }
    engine.stopLoop()
    expect(f.oscs.length).toBeGreaterThan(300)
    expect(maxLive).toBeLessThan(24)
  })

  it('switches mood without restarting the music', () => {
    const f = clockedCtx()
    const engine = new AudioEngine(() => f.ctx, seededRng(11))
    engine.startLoop('calm')
    f.advance(10)
    const calmNotes = f.oscs.length
    engine.startLoop('tense')
    f.advance(10)
    engine.stopLoop()
    // The tense feel pulses the bass on every eighth, so it plays more notes.
    expect(f.oscs.length - calmNotes).toBeGreaterThan(calmNotes)
  })

  it('stops scheduling once stopped', () => {
    const f = clockedCtx()
    const engine = new AudioEngine(() => f.ctx, seededRng(5))
    engine.startLoop('calm')
    f.advance(5)
    engine.stopLoop()
    const count = f.oscs.length
    f.advance(5)
    expect(f.oscs.length).toBe(count)
  })

  it('skips missed steps after a stall instead of playing them at once', () => {
    const f = clockedCtx()
    const engine = new AudioEngine(() => f.ctx, seededRng(9))
    engine.startLoop('calm')
    f.advance(2)
    const before = f.oscs.length
    // The audio clock runs on while the page's timers were frozen.
    ;(f.ctx as unknown as { currentTime: number }).currentTime += 60
    f.advance(0.05)
    engine.stopLoop()
    const late = f.oscs.slice(before).filter((o) => o.startAt < f.ctx.currentTime - 0.2)
    expect(late).toHaveLength(0)
  })

  it('resumes a suspended context before playing', () => {
    const f = clockedCtx('suspended')
    const engine = new AudioEngine(() => f.ctx)
    engine.play('reveal')
    expect(f.resumes.length).toBe(1)
  })
})
