import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import type { ContentBlock } from '../../../shared/api/mockData'
import { useReaderStore } from '../store/useReaderStore'
import type { ReaderHandle } from './ReaderHandle'
import ReaderContentBlocks, { type ReaderPrefs } from './ReaderContentBlocks'

interface PaginatedReaderProps {
  content: ContentBlock[]
  prefs: ReaderPrefs
  onEntityTrigger: (entityId: string) => void
}

// Spec 2.2: paginated mode uses CSS multi-column to lay the flowing text out
// into fixed-width "pages"; progress = currentPage / totalPages.
const PaginatedReader = forwardRef<ReaderHandle, PaginatedReaderProps>(
  ({ content, prefs, onEntityTrigger }, ref) => {
    const outerRef = useRef<HTMLDivElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)
    const [pageWidth, setPageWidth] = useState(0)

    const currentPage = useReaderStore((s) => s.currentPage)
    const totalPages = useReaderStore((s) => s.totalPages)
    const setCurrentPage = useReaderStore((s) => s.setCurrentPage)
    const setTotalPages = useReaderStore((s) => s.setTotalPages)
    const setProgress = useReaderStore((s) => s.setProgress)

    const recalculate = useCallback(() => {
      const outer = outerRef.current
      const inner = innerRef.current
      if (!outer || !inner) return
      const width = outer.clientWidth
      setPageWidth(width)
      const total = Math.max(1, Math.round(inner.scrollWidth / width))
      setTotalPages(total)
      setCurrentPage(Math.min(useReaderStore.getState().currentPage, total))
    }, [setTotalPages, setCurrentPage])

    useLayoutEffect(() => {
      recalculate()
      const observer = new ResizeObserver(recalculate)
      if (outerRef.current) observer.observe(outerRef.current)
      return () => observer.disconnect()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, prefs.fontSizeRem, prefs.lineHeight, prefs.fontFamily])

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
      <div ref={outerRef} className="h-full overflow-hidden px-6 py-10 lg:px-16">
        <div
          ref={innerRef}
          className="h-full transition-transform duration-300 ease-out"
          style={{
            columnWidth: pageWidth || undefined,
            columnGap: 0,
            transform: `translateX(-${(currentPage - 1) * pageWidth}px)`,
          }}
        >
          <ReaderContentBlocks content={content} prefs={prefs} onEntityTrigger={onEntityTrigger} />
        </div>
      </div>
    )
  },
)

PaginatedReader.displayName = 'PaginatedReader'

export default PaginatedReader
