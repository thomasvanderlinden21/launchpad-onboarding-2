import { useRef, useState, useCallback, useEffect, RefObject } from 'react'

// Gap from bottom (px) that counts as "at bottom"
const THRESHOLD = 72

function getGap(el: HTMLElement) {
  return el.scrollHeight - el.scrollTop - el.clientHeight
}

export interface UseConversationScrollReturn {
  scrollRef:        RefObject<HTMLDivElement>
  bottomAnchorRef:  RefObject<HTMLDivElement>
  showJumpToLatest: boolean
  jumpToLatest:     () => void
}

/**
 * Manages auto-scroll for a conversation list.
 *
 * Key design decisions that fix the "can't scroll up" bug:
 *
 * 1. programmaticLock: counter (not bool). Incremented before ANY scroll we
 *    initiate, decremented in the next rAF. Scroll events while lock > 0 are
 *    completely ignored — they cannot accidentally resume or suspend.
 *
 * 2. scrollTop = scrollHeight (not scrollIntoView). Synchronous, single event,
 *    no smooth-scroll cascade of intermediate events.
 *
 * 3. ResizeObserver only recalculates isAtBottom. It NEVER calls scrollTop
 *    itself. If the user is suspended, resize is irrelevant.
 *    If not suspended and we're at bottom, we do one programmatic snap
 *    (guarded by the lock) so growing content doesn't drift away.
 *
 * 4. Suspension detection layers:
 *    - wheel deltaY < 0: immediate suspend before scroll event arrives
 *    - scroll event + gap > THRESHOLD + lock == 0: suspend (covers trackpad,
 *      scrollbar drag, keyboard, momentum)
 *    - touching and moving upward: suspend
 *
 * 5. Auto-scroll only in the deps-change effect. No other place calls scroll.
 */
export function useConversationScroll(deps: unknown[]): UseConversationScrollReturn {
  const scrollRef       = useRef<HTMLDivElement>(null)
  const bottomAnchorRef = useRef<HTMLDivElement>(null)

  // Refs for state that must be readable in event listeners without stale closures
  const suspendedRef = useRef(false)
  const hasNewRef    = useRef(false)       // new content arrived while suspended
  const lockRef      = useRef(0)           // >0 while WE are doing a programmatic scroll

  const [showJumpToLatest, setShowJumpToLatest] = useState(false)

  const syncUI = useCallback(() => {
    setShowJumpToLatest(suspendedRef.current && hasNewRef.current)
  }, [])

  // ─── programmatic scroll (synchronous, lock-guarded) ─────────────────────────
  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    lockRef.current += 1
    el.scrollTop = el.scrollHeight          // synchronous, fires ONE scroll event
    requestAnimationFrame(() => {
      lockRef.current = Math.max(0, lockRef.current - 1)
    })
  }, [])

  // ─── public: jump to latest ───────────────────────────────────────────────────
  const jumpToLatest = useCallback(() => {
    suspendedRef.current = false
    hasNewRef.current    = false
    syncUI()
    scrollToBottom()
  }, [syncUI, scrollToBottom])

  // ─── auto-scroll on new content (deps change) ─────────────────────────────────
  useEffect(() => {
    if (suspendedRef.current) {
      hasNewRef.current = true
      syncUI()
    } else {
      scrollToBottom()
    }
    // deps are intentionally spread — caller controls what triggers this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  // ─── scroll event: detect bottom / unsuspend ──────────────────────────────────
  // Also detects user-initiated upward scroll (gap > threshold while lock == 0)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let rafId = 0
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        // Ignore scrolls we triggered
        if (lockRef.current > 0) return

        const gap = getGap(el)
        if (gap <= THRESHOLD) {
          // User (or momentum) brought us back to bottom → resume
          suspendedRef.current = false
          hasNewRef.current    = false
          syncUI()
        } else {
          // User has scrolled away from bottom → suspend
          if (!suspendedRef.current) {
            suspendedRef.current = true
            syncUI()
          }
        }
      })
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(rafId)
      el.removeEventListener('scroll', onScroll)
    }
  }, [syncUI])

  // ─── wheel: immediate suspend on upward scroll ────────────────────────────────
  // (fires before the scroll event, giving instant feedback)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0 && lockRef.current === 0 && !suspendedRef.current) {
        suspendedRef.current = true
        // hasNew stays false here; will be set when next message arrives
        syncUI()
      }
    }

    el.addEventListener('wheel', onWheel, { passive: true })
    return () => el.removeEventListener('wheel', onWheel)
  }, [syncUI])

  // ─── touch: suspend on upward swipe ───────────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let startY = 0
    const onStart = (e: TouchEvent) => { startY = e.touches[0].clientY }
    const onMove  = (e: TouchEvent) => {
      // finger moves DOWN = list scrolls UP
      if (e.touches[0].clientY > startY + 4 && lockRef.current === 0 && !suspendedRef.current) {
        suspendedRef.current = true
        syncUI()
      }
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove',  onMove,  { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove',  onMove)
    }
  }, [syncUI])

  // ─── keyboard: PageUp / Home / ArrowUp → suspend ─────────────────────────────
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onKey = (e: KeyboardEvent) => {
      if (['PageUp', 'Home', 'ArrowUp'].includes(e.key) && lockRef.current === 0) {
        suspendedRef.current = true
        syncUI()
      }
    }

    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [syncUI])

  // ─── ResizeObserver: recalculate position only ────────────────────────────────
  // Never forces a scroll. If we're NOT suspended and content grew while we were
  // at the bottom, nudge scrollTop so content doesn't drift (still lock-guarded).
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let rafId = 0
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (lockRef.current > 0) return          // already scrolling programmatically
        if (suspendedRef.current) return         // user is reading history — leave alone
        if (getGap(el) > THRESHOLD) return       // we drifted; don't snap back silently
        // We're at (or very near) the bottom and content grew: stay pinned
        lockRef.current += 1
        el.scrollTop = el.scrollHeight
        requestAnimationFrame(() => {
          lockRef.current = Math.max(0, lockRef.current - 1)
        })
      })
    })

    ro.observe(el)
    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
    }
  }, [])

  // ─── window resize (mobile keyboard) ──────────────────────────────────────────
  useEffect(() => {
    let rafId = 0
    const onResize = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (!suspendedRef.current) scrollToBottom()
      })
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
    }
  }, [scrollToBottom])

  return { scrollRef, bottomAnchorRef, showJumpToLatest, jumpToLatest }
}
