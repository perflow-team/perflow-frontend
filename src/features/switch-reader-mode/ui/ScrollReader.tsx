import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { ContentBlock, EntityMark } from '@/entities/chapter/model/types'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'
import type { ReaderHandle } from '@/features/switch-reader-mode/lib/ReaderHandle'
import ReaderContentBlocks, { type ReaderPrefs } from '@/entities/chapter/ui/ReaderContentBlocks'

interface ScrollReaderProps {
  scope: string
  content: ContentBlock[]
  entities: EntityMark[]
  prefs: ReaderPrefs
  onEntityTrigger: (word: string, contextSentence: string, lookupOffset: number) => void
}

// Spec 2.2: progress = scrollTop / (scrollHeight - clientHeight)
const ScrollReader = forwardRef<ReaderHandle, ScrollReaderProps>(({ content, entities, prefs, onEntityTrigger, scope }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const setProgress = useReaderStore((s) => s.setProgress)
  const setCutoff = useReaderStore((s) => s.setCutoff)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleScroll = () => {
      const max = el.scrollHeight - el.clientHeight
      setProgress(max <= 0 ? 1 : el.scrollTop / max)
      const bottom = el.getBoundingClientRect().bottom
      let offset = 0
      for (const paragraph of el.querySelectorAll<HTMLElement>('[data-source-end]')) {
        if (paragraph.getBoundingClientRect().bottom > bottom) break
        offset = Number(paragraph.dataset.sourceEnd)
      }
      setCutoff(scope, offset)
    }

    handleScroll()
    el.addEventListener('scroll', handleScroll, { passive: true })
    const observer = new ResizeObserver(handleScroll)
    observer.observe(el)
    if (el.firstElementChild) observer.observe(el.firstElementChild)
    return () => { el.removeEventListener('scroll', handleScroll); observer.disconnect() }
  }, [setProgress, setCutoff, scope, content, prefs.fontSizeRem, prefs.lineHeight, prefs.fontFamily])

  useImperativeHandle(ref, () => ({
    pageForward: () => containerRef.current?.scrollBy({ top: containerRef.current.clientHeight, behavior: 'smooth' }),
    pageBackward: () =>
      containerRef.current?.scrollBy({ top: -containerRef.current.clientHeight, behavior: 'smooth' }),
    jumpToProgress: (progress) => {
      const el = containerRef.current
      if (!el) return
      const max = el.scrollHeight - el.clientHeight
      el.scrollTo({ top: max * progress, behavior: 'smooth' })
    },
  }))

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-6 py-10 lg:px-16">
        <ReaderContentBlocks content={content} entities={entities} prefs={prefs} onEntityTrigger={onEntityTrigger} />
      </div>
    </div>
  )
})

ScrollReader.displayName = 'ScrollReader'

export default ScrollReader
