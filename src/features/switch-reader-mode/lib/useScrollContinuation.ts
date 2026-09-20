import { useEffect, type RefObject } from 'react'
import { createContinuationGesture } from './continuationGesture'

export function useScrollContinuation(
  containerRef: RefObject<HTMLDivElement | null>,
  onContinue?: () => Promise<boolean>,
) {
  useEffect(() => {
    const el = containerRef.current
    if (!el || !onContinue) return
    const gesture = createContinuationGesture(performance.now())
    let pending = false
    let disposed = false
    let touch: { x: number; y: number } | null = null
    const atEnd = () => el.scrollHeight - el.clientHeight - Math.max(0, el.scrollTop) <= 2
    const observe = () => gesture.updateEnd(atEnd(), performance.now())
    const blocked = () => pending || !!document.querySelector('[aria-modal="true"]')
    const advance = async () => {
      pending = true
      try { await onContinue() }
      finally {
        if (!disposed) { pending = false; gesture.retry(performance.now()); observe() }
      }
    }
    const wheel = (event: WheelEvent) => {
      if (blocked() || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
      observe()
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? el.clientHeight : 1)
      if (atEnd() && delta > 0) event.preventDefault()
      if (gesture.wheel(delta, performance.now())) void advance()
    }
    const start = (event: TouchEvent) => {
      touch = null
      gesture.cancelTouch()
      if (blocked() || event.touches.length !== 1) return
      observe()
      touch = { x: event.touches[0].clientX, y: event.touches[0].clientY }
      gesture.touchStart(performance.now())
    }
    const end = (event: TouchEvent) => {
      if (!touch || blocked() || event.touches.length !== 0) { touch = null; gesture.cancelTouch(); return }
      const point = event.changedTouches[0]
      observe()
      if (point && gesture.touchEnd(touch.y - point.clientY, touch.x - point.clientX)) void advance()
      touch = null
    }
    const cancel = () => { touch = null; gesture.cancelTouch() }
    const key = (event: KeyboardEvent) => {
      if (blocked() || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
      if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select, [contenteditable="true"], [role="button"]')) return
      if (!['ArrowDown', 'PageDown', ' '].includes(event.key)) return
      observe()
      if (gesture.key(performance.now(), event.repeat)) { event.preventDefault(); void advance() }
    }
    observe()
    const observer = new ResizeObserver(observe)
    observer.observe(el)
    if (el.firstElementChild) observer.observe(el.firstElementChild)
    el.addEventListener('scroll', observe, { passive: true })
    el.addEventListener('wheel', wheel, { passive: false })
    el.addEventListener('touchstart', start, { passive: true })
    el.addEventListener('touchend', end, { passive: true })
    el.addEventListener('touchcancel', cancel, { passive: true })
    el.addEventListener('keydown', key)
    return () => {
      disposed = true
      observer.disconnect()
      el.removeEventListener('scroll', observe)
      el.removeEventListener('wheel', wheel)
      el.removeEventListener('touchstart', start)
      el.removeEventListener('touchend', end)
      el.removeEventListener('touchcancel', cancel)
      el.removeEventListener('keydown', key)
    }
  }, [containerRef, onContinue])
}
