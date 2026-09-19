import { ChevronLeft, ChevronRight } from 'lucide-react'
import { type ReactNode, useEffect, useRef, useState } from 'react'

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

function animateScrollTo(el: HTMLElement, to: number, duration: number, onDone?: () => void) {
  const from = el.scrollLeft
  const change = to - from
  if (Math.abs(change) < 1) {
    onDone?.()
    return () => {}
  }
  const start = performance.now()
  let rafId = requestAnimationFrame(function step(now) {
    const t = Math.min(1, (now - start) / duration)
    el.scrollLeft = from + change * easeInOutCubic(t)
    if (t < 1) {
      rafId = requestAnimationFrame(step)
    } else {
      onDone?.()
    }
  })
  return () => cancelAnimationFrame(rafId)
}

interface ScrollCarouselProps {
  children: ReactNode
  /**
   * Vertical center of the prev/next buttons as Tailwind `top-*` classes,
   * matching the row's card art height at each breakpoint. Defaults to
   * NovelCard's own responsive cover height (128/168/230px wide, 23:30).
   */
  buttonTopClassName?: string
}

function ScrollCarousel({ children, buttonTopClassName = 'top-[84px] sm:top-[110px] md:top-[150px]' }: ScrollCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const updateScrollState = () => {
    const el = trackRef.current
    if (!el) return
    setCanScrollPrev(el.scrollLeft > 4)
    setCanScrollNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let stopped = false
    const timers: number[] = []
    let cancelAnim = () => {}
    const stop = () => { stopped = true; cancelAnim() }
    el.addEventListener('pointerdown', stop)
    el.addEventListener('wheel', stop, { passive: true })

    const GLIDE_MS = 2800
    const HOLD_MS = 1200
    const REST_MS = 5000

    const cycle = () => {
      if (stopped) return
      const maxScroll = el.scrollWidth - el.clientWidth
      if (maxScroll < 24) {
        timers.push(window.setTimeout(cycle, REST_MS))
        return
      }
      cancelAnim = animateScrollTo(el, maxScroll, GLIDE_MS, () => {
        if (stopped) return
        timers.push(window.setTimeout(() => {
          if (stopped) return
          cancelAnim = animateScrollTo(el, 0, GLIDE_MS, () => {
            if (!stopped) timers.push(window.setTimeout(cycle, REST_MS))
          })
        }, HOLD_MS))
      })
    }
    timers.push(window.setTimeout(cycle, REST_MS))

    return () => {
      stopped = true
      cancelAnim()
      timers.forEach(clearTimeout)
      el.removeEventListener('pointerdown', stop)
      el.removeEventListener('wheel', stop)
    }
  }, [])

  const page = (direction: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div ref={trackRef} className="scrollbar-hide flex gap-3 overflow-x-auto pb-2 sm:gap-4">
        {children}
      </div>

      {canScrollPrev && (
        <button
          type="button"
          aria-label="이전"
          onClick={() => page(-1)}
          className={`absolute left-0 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-700 shadow-md ring-1 ring-neutral-200 transition hover:bg-neutral-50 sm:-translate-x-1/2 md:h-9 md:w-9 ${buttonTopClassName}`}
        >
          <ChevronLeft size={16} className="md:hidden" />
          <ChevronLeft size={18} className="hidden md:block" />
        </button>
      )}
      {canScrollNext && (
        <button
          type="button"
          aria-label="다음"
          onClick={() => page(1)}
          className={`absolute right-0 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-700 shadow-md ring-1 ring-neutral-200 transition hover:bg-neutral-50 sm:translate-x-1/2 md:h-9 md:w-9 ${buttonTopClassName}`}
        >
          <ChevronRight size={16} className="md:hidden" />
          <ChevronRight size={18} className="hidden md:block" />
        </button>
      )}
    </div>
  )
}

export default ScrollCarousel
