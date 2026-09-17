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
  onEntityTrigger: (word: string, contextSentence: string) => void
}

function ReaderContentBlocks({ content, entities, prefs, onEntityTrigger }: ReaderContentBlocksProps) {
  const { getHandlers } = useEntityTrigger(onEntityTrigger)

  // Spec 2.3: 인물명/고유명사 마킹 — the chapter API now sends entity spans
  // ({word, start_offset, end_offset}) alongside the raw text, so only the
  // words the backend actually flagged are look-up-able (not every word).
  const renderBlock = (block: ContentBlock) => {
    const blockEnd = block.start + block.text.length
    const marks = entities
      .filter((e) => e.start_offset >= block.start && e.end_offset <= blockEnd)
      .sort((a, b) => a.start_offset - b.start_offset)

    const parts: ReactNode[] = []
    let cursor = block.start

    marks.forEach((mark, i) => {
      if (mark.start_offset > cursor) {
        parts.push(<span key={`t-${i}`}>{block.text.slice(cursor - block.start, mark.start_offset - block.start)}</span>)
      }
      const word = block.text.slice(mark.start_offset - block.start, mark.end_offset - block.start)
      parts.push(
        <span
          key={`e-${i}`}
          {...getHandlers(word, block.text)}
          className="cursor-pointer rounded-sm transition-colors hover:bg-primary-100"
        >
          {word}
        </span>,
      )
      cursor = Math.max(cursor, mark.end_offset)
    })

    if (cursor < blockEnd) {
      parts.push(<span key="t-last">{block.text.slice(cursor - block.start)}</span>)
    }

    return parts
  }

  return (
    <div
      // Plain block flow on purpose: PaginatedReader lays this out inside a
      // CSS multi-column container, and flex/grid formatting contexts don't
      // fragment across columns — they'd render as one tall, unbroken box
      // and bleed past the page viewport instead of splitting into pages.
      className={`space-y-3 ${prefs.nightMode ? 'text-neutral-200' : 'text-neutral-800'}`}
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
            className={`mt-4 text-title-large font-semibold ${prefs.nightMode ? 'text-neutral-50' : 'text-neutral-900'}`}
          >
            {block.text}
          </h2>
        ) : (
          <p key={i} data-paragraph-index={i}>
            {renderBlock(block)}
          </p>
        ),
      )}
    </div>
  )
}

export default ReaderContentBlocks
