import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { EntityPreview, type PreviewTarget } from '@/features/lookup-word/ui/EntityPreview'
import type { ContentBlock, EntityMark } from '@/entities/chapter/model/types'
import { useEntityTrigger } from '@/entities/chapter/lib/useEntityTrigger'

export interface ReaderPrefs {
  fontSizeRem: number
  lineHeight: number
  fontFamily: 'sans' | 'serif'
  nightMode: boolean
}

interface ReaderContentBlocksProps {
  content: ContentBlock[]
  entities: EntityMark[]
  prefs: ReaderPrefs
  onEntityTrigger: (word: string, contextSentence: string, lookupOffset: number) => void
}

function ReaderContentBlocks({ content, entities, prefs, onEntityTrigger }: ReaderContentBlocksProps) {
  const { novelId = '1', episodeId = '1' } = useParams()
  const [preview, setPreview] = useState<PreviewTarget | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelTimer = () => { if (timer.current) clearTimeout(timer.current) }
  const dismiss = () => { cancelTimer(); setPreview(null) }
  const leavePreview = () => { cancelTimer(); timer.current = setTimeout(() => setPreview(null), 180) }
  const showPreview = (target: PreviewTarget) => {
    cancelTimer()
    timer.current = setTimeout(() => setPreview(target), 350)
  }
  const { getHandlers } = useEntityTrigger((...args) => { dismiss(); onEntityTrigger(...args) })
  useEffect(() => {
    const close = () => { if (timer.current) clearTimeout(timer.current); setPreview(null) }
    const escape = (event: globalThis.KeyboardEvent) => { if (event.key === 'Escape') close() }
    const onScroll = (event: Event) => {
      if (!(event.target instanceof Element) || !event.target.closest('#reader-word-preview')) close()
    }
    window.addEventListener('keydown', escape)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', close)
    return () => {
      if (timer.current) clearTimeout(timer.current)
      window.removeEventListener('keydown', escape)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', close)
    }
  }, [])

  const renderBlock = (block: ContentBlock) => {
    const blockEnd = block.start + block.text.length
    const marks = entities
      .filter((e) => e.start_offset < blockEnd && e.end_offset > block.start)
      .sort((a, b) => a.start_offset - b.start_offset || b.end_offset - a.end_offset)

    const parts: ReactNode[] = []
    let cursor = block.start

    marks.forEach((mark, i) => {
      const start = Math.max(block.start, mark.start_offset)
      const end = Math.min(blockEnd, mark.end_offset)
      if (end <= start || start < cursor) return
      if (start > cursor) {
        parts.push(<span key={`t-${i}`}>{block.text.slice(cursor - block.start, start - block.start)}</span>)
      }
      const visibleText = block.text.slice(start - block.start, end - block.start)
      parts.push(
        <span
          key={`e-${i}`}
          {...getHandlers(mark.word, block.contextSentence ?? block.text, mark.lookup_offset ?? mark.end_offset)}
          onPointerEnter={(event) => {
            if (event.pointerType !== 'mouse') return
            const target = { word: mark.word, contextSentence: block.contextSentence ?? block.text,
              currentCharOffset: mark.lookup_offset ?? mark.end_offset, rect: event.currentTarget.getBoundingClientRect() }
            showPreview(target)
          }}
          onPointerLeave={leavePreview}
          onFocus={(event) => showPreview({ word: mark.word, contextSentence: block.contextSentence ?? block.text,
            currentCharOffset: mark.lookup_offset ?? mark.end_offset, rect: event.currentTarget.getBoundingClientRect() })}
          onBlur={leavePreview}
          aria-describedby={preview?.word === mark.word ? 'reader-word-preview' : undefined}
          role="button"
          tabIndex={0}
          aria-label={`${mark.word} 설명 보기`}
          data-lookup-word={mark.word}
          className={`cursor-pointer select-none rounded-sm no-underline outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-400 ${prefs.nightMode ? 'hover:bg-primary-800' : 'hover:bg-primary-100'}`}
        >
          {visibleText}
        </span>,
      )
      cursor = end
    })

    if (cursor < blockEnd) {
      parts.push(<span key="t-last">{block.text.slice(cursor - block.start)}</span>)
    }

    return parts
  }

  return (
    <><div
      className={`space-y-3 [overflow-wrap:anywhere] ${prefs.nightMode ? 'text-neutral-200' : 'text-neutral-800'}`}
      style={{
        fontSize: `${prefs.fontSizeRem}rem`,
        lineHeight: prefs.lineHeight,
        fontFamily:
          prefs.fontFamily === 'serif' ? '"Noto Serif KR", "Nanum Myeongjo", Georgia, serif' : 'var(--font-sans)',
      }}
    >
      {content.map((block, i) =>
        block.type === 'heading' ? (
          <h2
            key={i}
            className={`text-title-large font-semibold ${prefs.nightMode ? 'text-neutral-50' : 'text-neutral-900'}`}
          >
            {block.text}
          </h2>
        ) : (
          <p key={i} data-paragraph-index={i} data-source-start={block.start} data-source-end={block.start + block.text.length}>
            {renderBlock(block)}
          </p>
        ),
      )}
    </div>
    {preview && <EntityPreview target={preview} novelId={novelId} episodeId={episodeId} onEnter={cancelTimer} onLeave={leavePreview} />}
    </>
  )
}

export default ReaderContentBlocks
