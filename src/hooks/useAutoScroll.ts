import { useEffect, useRef, RefObject } from 'react'

interface UseAutoScrollOptions {
  enabled: boolean
  behavior?: ScrollBehavior
  block?: ScrollLogicalPosition
  /** ms to wait after enabled flips before first scroll */
  delay?: number
}

/**
 * Scrolls `targetRef` into view when `enabled` becomes true.
 * Also observes size changes on the element via ResizeObserver so
 * late-painting content (fonts, dynamic height) triggers a re-scroll.
 */
export function useAutoScroll(
  targetRef: RefObject<HTMLElement | null>,
  { enabled, behavior = 'smooth', block = 'nearest', delay = 80 }: UseAutoScrollOptions,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)

  useEffect(() => {
    if (!enabled || !targetRef.current) return

    const el = targetRef.current

    el.style.scrollMarginTop = '32px'

    const scroll = () => {
      el.scrollIntoView({ behavior, block, inline: 'nearest' })
    }

    // Fire once after initial delay (lets entrance animation start)
    const raf = requestAnimationFrame(() => {
      timerRef.current = setTimeout(scroll, delay)
    })

    // Re-scroll whenever the element resizes (e.g. font loads, content expands)
    observerRef.current = new ResizeObserver(() => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(scroll, 40)
    })
    observerRef.current.observe(el)

    return () => {
      cancelAnimationFrame(raf)
      if (timerRef.current) clearTimeout(timerRef.current)
      observerRef.current?.disconnect()
    }
  }, [enabled, behavior, block, delay])
}
