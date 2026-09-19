import { ChevronLeft, ChevronRight } from 'lucide-react'
import { type ReactNode, useEffect, useRef, useState } from 'react'

interface ScrollCarouselProps {
  children: ReactNode
  /** Vertical center of the prev/next buttons, matching the row's card art height. */
  buttonOffset?: number
}

// Button-paged horizontal rail. Buttons only render when there's somewhere
// to go, so the row never shows a dead arrow at either end.
function ScrollCarousel({ children, buttonOffset = 150 }: ScrollCarouselProps) {
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

  const page = (direction: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div ref={trackRef} className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth pb-2">
        {children}
      </div>

      {canScrollPrev && (
        <button
          type="button"
          aria-label="이전"
          onClick={() => page(-1)}
          style={{ top: buttonOffset }}
          className="absolute left-0 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-700 shadow-md ring-1 ring-neutral-200 transition hover:bg-neutral-50 sm:-translate-x-1/2"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      {canScrollNext && (
        <button
          type="button"
          aria-label="다음"
          onClick={() => page(1)}
          style={{ top: buttonOffset }}
          className="absolute right-0 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-700 shadow-md ring-1 ring-neutral-200 transition hover:bg-neutral-50 sm:translate-x-1/2"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  )
}

export default ScrollCarousel
