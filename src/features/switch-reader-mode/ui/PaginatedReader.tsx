import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import type { ContentBlock } from '@/entities/chapter/model/types'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'
import type { ReaderHandle } from '@/features/switch-reader-mode/lib/ReaderHandle'
import ReaderContentBlocks, { type ReaderPrefs } from '@/entities/chapter/ui/ReaderContentBlocks'

interface PaginatedReaderProps {
  content: ContentBlock[]
  prefs: ReaderPrefs
  onEntityTrigger: (word: string, contextSentence: string) => void
}

// Spec 2.2: paginated mode uses CSS multi-column to lay the flowing text out
// into fixed-width "pages"; progress = currentPage / totalPages.
//
// The outer wrapper mirrors ScrollReader's content column exactly
// (mx-auto max-w-2xl + same padding) so the reading column is the same
// pixel width in both modes — only overflow-hidden is added here, since
// this element also acts as the page "viewport" for the column transform.
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
      const style = getComputedStyle(outer)
      const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
      const width = outer.clientWidth - paddingX
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
      <div ref={outerRef} className="mx-auto h-full w-full max-w-2xl overflow-hidden px-6 py-10 lg:px-16">
        <div
          ref={innerRef}
          className="h-full transition-transform duration-300 ease-out"
          style={{
            columnWidth: pageWidth || undefined,
            width: pageWidth || undefined,
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
