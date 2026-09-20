import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import type { ContentBlock, EntityMark } from '@/entities/chapter/model/types'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'
import type { ReaderHandle } from '@/features/switch-reader-mode/lib/ReaderHandle'
import { paginateContent } from '@/features/switch-reader-mode/lib/paginateContent'
import ReaderContentBlocks, { type ReaderPrefs } from '@/entities/chapter/ui/ReaderContentBlocks'

interface PaginatedReaderProps {
  scope: string
  content: ContentBlock[]
  entities: EntityMark[]
  prefs: ReaderPrefs
  onEntityTrigger: (word: string, contextSentence: string, lookupOffset: number, selectionCharOffset?: number) => void
}

const PaginatedReader = forwardRef<ReaderHandle, PaginatedReaderProps>(
  ({ content, entities, prefs, onEntityTrigger, scope }, ref) => {
    const outerRef = useRef<HTMLDivElement>(null)
    const measureRef = useRef<HTMLDivElement>(null)
    const layoutRef = useRef<{ content: ContentBlock[]; pages: ContentBlock[][] } | null>(null)
    const [pages, setPages] = useState<ContentBlock[][]>([])
    const currentPage = useReaderStore((s) => s.currentPage)
    const setCurrentPage = useReaderStore((s) => s.setCurrentPage)
    const setTotalPages = useReaderStore((s) => s.setTotalPages)
    const setPosition = useReaderStore((s) => s.setPosition)
    const lastBlock = content.at(-1)
    const totalChars = lastBlock ? lastBlock.start + lastBlock.text.length : 0

    const recalculate = useCallback(() => {
      const outer = outerRef.current
      const measure = measureRef.current
      if (!outer || !measure) return
      const style = getComputedStyle(outer)
      const width = outer.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      const pageHeight = outer.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
      if (width <= 0 || pageHeight <= 0) return
      measure.style.width = `${width}px`
      const children = Array.from(measure.firstElementChild?.children ?? []) as HTMLElement[]
      if (children.length !== content.length) return
      const probe = measure.firstElementChild!.cloneNode(false) as HTMLElement
      const probes = children.map((el) => el.cloneNode(false) as HTMLElement)
      measure.appendChild(probe)
      let newPages: ContentBlock[][]
      try {
        newPages = paginateContent(content, pageHeight, (index, text) => {
          const el = probes[index]
          probe.replaceChildren(el)
          el.textContent = text
          return el.getBoundingClientRect().height
        })
      } finally {
        probe.remove()
      }

      const previous = layoutRef.current
      const anchor = previous?.content === content
        ? previous.pages[useReaderStore.getState().currentPage - 1]?.[0]?.start ?? 0
        : 0
      const index = newPages.findIndex((page) => {
        const last = page.at(-1)
        return last && last.start + last.text.length > anchor
      })
      layoutRef.current = { content, pages: newPages }
      setPages(newPages)
      setTotalPages(newPages.length)
      setCurrentPage(Math.max(0, index) + 1)
    }, [content, setTotalPages, setCurrentPage])

    useLayoutEffect(() => {
      recalculate()
      let active = true
      void document.fonts.ready.then(() => { if (active) recalculate() })
      const observer = new ResizeObserver(recalculate)
      if (outerRef.current) observer.observe(outerRef.current)
      return () => { active = false; observer.disconnect() }
    }, [recalculate, prefs.fontSizeRem, prefs.lineHeight, prefs.fontFamily])

    useEffect(() => {
      const last = pages[currentPage - 1]?.at(-1)
      if (!last || !totalChars) return
      const offset = last.start + last.text.length
      setPosition(scope, offset / totalChars, offset)
    }, [currentPage, pages, totalChars, setPosition, scope])

    useImperativeHandle(ref, () => ({
      pageForward: () => {
        const state = useReaderStore.getState()
        setCurrentPage(Math.min(state.totalPages, state.currentPage + 1))
      },
      pageBackward: () => setCurrentPage(Math.max(1, useReaderStore.getState().currentPage - 1)),
      jumpToProgress: (progress) => {
        const offset = Math.max(0, Math.min(1, progress)) * totalChars
        const index = pages.findIndex((page) => {
          const last = page.at(-1)
          return last && last.start + last.text.length >= offset
        })
        setCurrentPage(index < 0 ? pages.length || 1 : index + 1)
      },
    }))

    return (
      <div ref={outerRef} className="mx-auto h-full w-full max-w-2xl overflow-y-auto px-6 py-10 lg:px-16" data-reader-pages="">
        <div ref={measureRef} aria-hidden="true" data-reader-measurer="" className="pointer-events-none invisible fixed left-0 top-0 -z-10">
          <ReaderContentBlocks content={content} entities={[]} prefs={prefs} onEntityTrigger={() => {}} />
        </div>
        <ReaderContentBlocks key={currentPage} content={pages[currentPage - 1] ?? []} entities={entities} prefs={prefs} onEntityTrigger={onEntityTrigger} />
      </div>
    )
  },
)

PaginatedReader.displayName = 'PaginatedReader'
export default PaginatedReader
