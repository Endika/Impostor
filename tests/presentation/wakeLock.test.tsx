import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useWakeLock } from '../../src/presentation/components/useWakeLock'

interface FakeSentinel {
  released: boolean
  release: ReturnType<typeof vi.fn>
}

function fakeWakeLock() {
  const sentinels: FakeSentinel[] = []
  const request = vi.fn(() => {
    const sentinel: FakeSentinel = {
      released: false,
      release: vi.fn(() => {
        sentinel.released = true
        return Promise.resolve()
      }),
    }
    sentinels.push(sentinel)
    return Promise.resolve(sentinel)
  })
  return { request, sentinels }
}

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: state })
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('useWakeLock', () => {
  let wakeLock: ReturnType<typeof fakeWakeLock>

  beforeEach(() => {
    wakeLock = fakeWakeLock()
    Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: wakeLock })
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
  })

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'wakeLock')
    Reflect.deleteProperty(document, 'visibilityState')
  })

  it('keeps the screen awake while mounted', async () => {
    renderHook(() => useWakeLock())
    await waitFor(() => expect(wakeLock.request).toHaveBeenCalledWith('screen'))
  })

  it('lets the screen sleep again on unmount', async () => {
    const { unmount } = renderHook(() => useWakeLock())
    await waitFor(() => expect(wakeLock.sentinels).toHaveLength(1))
    unmount()
    expect(wakeLock.sentinels[0]?.release).toHaveBeenCalled()
  })

  it('takes the lock again when the page comes back into view', async () => {
    renderHook(() => useWakeLock())
    await waitFor(() => expect(wakeLock.sentinels).toHaveLength(1))
    const first = wakeLock.sentinels[0]
    if (first) first.released = true
    act(() => setVisibility('hidden'))
    act(() => setVisibility('visible'))
    await waitFor(() => expect(wakeLock.request).toHaveBeenCalledTimes(2))
  })

  it('does nothing where the browser has no wake lock', () => {
    Reflect.deleteProperty(navigator, 'wakeLock')
    expect(() => renderHook(() => useWakeLock())).not.toThrow()
  })

  it('swallows a refused request', async () => {
    wakeLock.request.mockImplementationOnce(() => Promise.reject(new Error('NotAllowedError')))
    renderHook(() => useWakeLock())
    await waitFor(() => expect(wakeLock.request).toHaveBeenCalled())
  })
})
