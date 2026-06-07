import { describe, it, expect } from 'vitest'
import { AudioEngine } from '../../src/presentation/audio/AudioEngine'

function fakeCtx() {
  const started: string[] = []
  const ctx = {
    createOscillator: () => ({
      type: '',
      frequency: { value: 0, setValueAtTime() {} },
      connect() {},
      start() {
        started.push('osc')
      },
      stop() {},
      disconnect() {},
    }),
    createGain: () => ({
      gain: {
        value: 1,
        setValueAtTime() {},
        linearRampToValueAtTime() {},
        exponentialRampToValueAtTime() {},
      },
      connect() {},
      disconnect() {},
    }),
    destination: {},
    currentTime: 0,
  } as unknown as AudioContext
  return { ctx, started }
}

describe('AudioEngine', () => {
  it('plays a sfx by starting oscillators', () => {
    const f = fakeCtx()
    const e = new AudioEngine(() => f.ctx)
    e.play('victoryCrew')
    expect(f.started.length).toBeGreaterThan(0)
  })

  it('plays nothing when muted', () => {
    const f = fakeCtx()
    const e = new AudioEngine(() => f.ctx)
    e.setMuted(true)
    e.play('victoryCrew')
    expect(f.started.length).toBe(0)
  })

  it('startLoop starts nodes; stopLoop is safe; muting stops the loop', () => {
    const f = fakeCtx()
    const e = new AudioEngine(() => f.ctx)
    e.startLoop('calm')
    expect(f.started.length).toBeGreaterThan(0)
    e.stopLoop()
    e.setMuted(true) // no throw
    expect(e.muted).toBe(true)
  })

  it('startLoop does nothing when muted', () => {
    const f = fakeCtx()
    const e = new AudioEngine(() => f.ctx)
    e.setMuted(true)
    e.startLoop('tense')
    expect(f.started.length).toBe(0)
  })

  it('stopLoop is safe with no running loop', () => {
    const f = fakeCtx()
    const e = new AudioEngine(() => f.ctx)
    expect(() => e.stopLoop()).not.toThrow()
  })

  it('plays every sfx variant', () => {
    const f = fakeCtx()
    const e = new AudioEngine(() => f.ctx)
    e.play('reveal')
    e.play('vote')
    e.play('victoryCrew')
    e.play('victoryImpostor')
    expect(f.started.length).toBeGreaterThan(0)
  })
})
