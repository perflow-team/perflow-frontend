import type { ReactNode } from 'react'
import type { ContentBlock, EntityMark } from '@/entities/chapter/model/types'
import { useEntityTrigger } from '@/features/lookup-word/lib/useEntityTrigger'

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
  const { getHandlers } = useEntityTrigger(onEntityTrigger)

  // Spec 2.3: 인물명/고유명사 마킹 — the chapter API now sends entity spans
  // ({word, start_offset, end_offset}) alongside the raw text, so only the
  // words the backend actually flagged are look-up-able (not every word).
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
          role="button"
          tabIndex={0}
          aria-label={`${mark.word} 설명 보기`}
          data-lookup-word={mark.word}
          className={`reader-lookup cursor-pointer select-none rounded-sm underline decoration-dotted decoration-primary-400/60 underline-offset-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-400 ${prefs.nightMode ? 'hover:bg-primary-800 hover:text-white' : 'hover:bg-primary-100 hover:text-primary-900'}`}
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
    <div
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
  )
}

export default ReaderContentBlocks
