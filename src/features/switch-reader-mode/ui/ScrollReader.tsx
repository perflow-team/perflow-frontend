import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { ContentBlock, EntityMark } from '@/entities/chapter/model/types'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'
import type { ReaderHandle } from '@/features/switch-reader-mode/lib/ReaderHandle'
import ReaderContentBlocks, { type ReaderPrefs } from '@/entities/chapter/ui/ReaderContentBlocks'
import { useScrollContinuation } from '../lib/useScrollContinuation'

interface ScrollReaderProps {
  scope: string
  content: ContentBlock[]
  entities: EntityMark[]
  prefs: ReaderPrefs
  onEntityTrigger: (word: string, contextSentence: string, lookupOffset: number, selectionCharOffset?: number) => void
  onContinue?: () => Promise<boolean>
  nextTitle?: string
  isLastChapter?: boolean
  continuing?: boolean
  continuationError?: string
}

const ScrollReader = forwardRef<ReaderHandle, ScrollReaderProps>(({ content, entities, prefs, onEntityTrigger, scope, onContinue, nextTitle, isLastChapter, continuing, continuationError }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const setPosition = useReaderStore((s) => s.setPosition)
  useScrollContinuation(containerRef, onContinue)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleScroll = () => {
      const max = el.scrollHeight - el.clientHeight
      const bottom = el.getBoundingClientRect().bottom
      let offset = 0
      for (const paragraph of el.querySelectorAll<HTMLElement>('[data-source-end]')) {
        if (paragraph.getBoundingClientRect().bottom > bottom) break
        offset = Number(paragraph.dataset.sourceEnd)
      }
      setPosition(scope, max <= 0 ? 1 : el.scrollTop / max, offset)
    }

    handleScroll()
    el.addEventListener('scroll', handleScroll, { passive: true })
    const observer = new ResizeObserver(handleScroll)
    observer.observe(el)
    if (el.firstElementChild) observer.observe(el.firstElementChild)
    return () => { el.removeEventListener('scroll', handleScroll); observer.disconnect() }
  }, [setPosition, scope, content, prefs.fontSizeRem, prefs.lineHeight, prefs.fontFamily])

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
    <div ref={containerRef} tabIndex={0} aria-label="소설 본문" className="h-full overflow-y-auto overscroll-y-contain focus-visible:outline-primary-400">
      <div className="mx-auto w-full max-w-2xl px-6 py-10 lg:px-16">
        <ReaderContentBlocks content={content} entities={entities} prefs={prefs} onEntityTrigger={onEntityTrigger} />
        {(onContinue || isLastChapter) && (
          <div className={`mt-12 border-t pt-8 text-center ${prefs.nightMode ? 'border-neutral-700 text-neutral-300' : 'border-neutral-200 text-neutral-500'}`}>
            {onContinue ? <>
              <p className="text-body-small">아래로 한 번 더 스크롤하면 다음 화가 이어져요</p>
              <button type="button" disabled={continuing} onClick={() => void onContinue()}
                className="mt-3 w-full truncate rounded-lg px-4 py-3 text-body-medium font-medium hover:bg-neutral-500/10 disabled:opacity-60">
                {continuing ? '다음 화를 불러오는 중…' : `다음 화 · ${nextTitle}`}
              </button>
              <p role="status" aria-live="polite" className="mt-2 min-h-20 text-body-small">
                {continuationError || (continuing ? '잠시만 기다려 주세요.' : '')}
              </p>
            </> : <p className="text-body-medium">마지막 화까지 모두 읽으셨어요.</p>}
          </div>
        )}
      </div>
    </div>
  )
})

ScrollReader.displayName = 'ScrollReader'

export default ScrollReader
