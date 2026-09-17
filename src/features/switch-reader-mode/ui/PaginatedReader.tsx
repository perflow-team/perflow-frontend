import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import type { ContentBlock, EntityMark } from '@/entities/chapter/model/types'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'
import type { ReaderHandle } from '@/features/switch-reader-mode/lib/ReaderHandle'
import ReaderContentBlocks, { type ReaderPrefs } from '@/entities/chapter/ui/ReaderContentBlocks'

interface PaginatedReaderProps {
  content: ContentBlock[]
  entities: EntityMark[]
  prefs: ReaderPrefs
  onEntityTrigger: (word: string, contextSentence: string) => void
}

// Gap between consecutive blocks, matching ReaderContentBlocks' `space-y-3`.
const BLOCK_GAP_PX = 12

// Spec 2.2: paginated mode slices `content` into pages that each fit the
// viewport, instead of paging within a single tall render.
//
// This used to render the whole chapter into one CSS multi-column box and
// slide between columns (via transform, then via scrollLeft). Both broke
// the same way: verified with a minimal, framework-free HTML repro that
// Chromium doesn't reliably clip an oversized multi-column box to an
// `overflow: hidden` ancestor — neighboring pages bled into view regardless
// of which clipping mechanism wrapped it. So pagination is done in JS
// instead: an off-screen copy of the content (same width/font, so it wraps
// identically) is measured block-by-block, and only the blocks that fit the
// current page are ever actually rendered — there is nothing left over for
// a browser clipping bug to leak.
const PaginatedReader = forwardRef<ReaderHandle, PaginatedReaderProps>(
  ({ content, entities, prefs, onEntityTrigger }, ref) => {
    const outerRef = useRef<HTMLDivElement>(null)
    const measureRef = useRef<HTMLDivElement>(null)
    const [measureWidth, setMeasureWidth] = useState(0)
    const [pages, setPages] = useState<ContentBlock[][]>([])

    const currentPage = useReaderStore((s) => s.currentPage)
    const totalPages = useReaderStore((s) => s.totalPages)
    const setCurrentPage = useReaderStore((s) => s.setCurrentPage)
    const setTotalPages = useReaderStore((s) => s.setTotalPages)
    const setProgress = useReaderStore((s) => s.setProgress)

    const recalculate = useCallback(() => {
      const outer = outerRef.current
      const measure = measureRef.current
      if (!outer || !measure) return
      const style = getComputedStyle(outer)
      const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
      const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
      const width = outer.clientWidth - paddingX
      const pageHeight = outer.clientHeight - paddingY
      if (width <= 0 || pageHeight <= 0) return
      // Set synchronously via the DOM, not just React state — state wouldn't
      // apply until the next render, but we need the measurer at the right
      // width right now, in this same pass, before reading heights below.
      measure.style.width = `${width}px`
      setMeasureWidth(width)

      // ReaderContentBlocks renders one wrapping div around all the blocks,
      // so the per-block elements are its children, not measure's own.
      const children = Array.from(measure.firstElementChild?.children ?? []) as HTMLElement[]
      const newPages: ContentBlock[][] = []
      let current: ContentBlock[] = []
      let currentHeight = 0

      children.forEach((el, i) => {
        const h = el.getBoundingClientRect().height
        const gap = current.length > 0 ? BLOCK_GAP_PX : 0
        if (current.length > 0 && currentHeight + gap + h > pageHeight) {
          newPages.push(current)
          current = [content[i]]
          currentHeight = h
        } else {
          current.push(content[i])
          currentHeight += gap + h
        }
      })
      if (current.length > 0) newPages.push(current)
      if (newPages.length === 0) newPages.push([])

      setPages(newPages)
      setTotalPages(newPages.length)
      setCurrentPage(Math.min(useReaderStore.getState().currentPage, newPages.length))
      // prefs affect the measurer's rendered block heights (font size, line
      // height, family) even though they aren't read directly in this body.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, prefs.fontSizeRem, prefs.lineHeight, prefs.fontFamily, setTotalPages, setCurrentPage])

    useLayoutEffect(() => {
      recalculate()
      const observer = new ResizeObserver(recalculate)
      if (outerRef.current) observer.observe(outerRef.current)
      return () => observer.disconnect()
    }, [recalculate])

    useEffect(() => {
      setProgress(totalPages > 0 ? currentPage / totalPages : 0)
    }, [currentPage, totalPages, setProgress])

    useImperativeHandle(ref, () => ({
      pageForward: () => setCurrentPage(Math.min(useReaderStore.getState().totalPages, currentPage + 1)),
      pageBackward: () => setCurrentPage(Math.max(1, currentPage - 1)),
      jumpToProgress: (progress) => {
        const total = useReaderStore.getState().totalPages
        const page = Math.min(total, Math.max(1, Math.round(progress * total) || 1))
        setCurrentPage(page)
      },
    }))

    return (
      <div ref={outerRef} className="mx-auto h-full w-full max-w-2xl overflow-hidden px-6 py-10 lg:px-16">
        {/* Off-screen: same width/font as the real page, so each block's
            measured height matches what it'll actually render at. */}
        <div
          ref={measureRef}
          aria-hidden="true"
          data-reader-measurer=""
          className="invisible absolute left-0 top-0 -z-10"
          style={{ width: measureWidth || undefined }}
        >
          <ReaderContentBlocks content={content} entities={[]} prefs={prefs} onEntityTrigger={() => {}} />
        </div>

        <ReaderContentBlocks
          content={pages[currentPage - 1] ?? []}
          entities={entities}
          prefs={prefs}
          onEntityTrigger={onEntityTrigger}
        />
      </div>
    )
  },
)

PaginatedReader.displayName = 'PaginatedReader'

export default PaginatedReader
