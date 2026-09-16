import type { ContentBlock } from '@/entities/chapter/model/types'
import { useEntityTrigger } from '@/features/lookup-word/lib/useEntityTrigger'

export interface ReaderPrefs {
  fontSizeRem: number
  lineHeight: number
  fontFamily: 'sans' | 'serif'
  nightMode: boolean
}

interface ReaderContentBlocksProps {
  content: ContentBlock[]
  prefs: ReaderPrefs
  onEntityTrigger: (word: string, contextSentence: string) => void
}

const WORD_PATTERN = /([가-힣a-zA-Z0-9]+)/

function ReaderContentBlocks({ content, prefs, onEntityTrigger }: ReaderContentBlocksProps) {
  const { getHandlers } = useEntityTrigger(onEntityTrigger)

  // Spec 2.3: 인물명/고유명사 마킹 — the API doesn't send entity boundaries
  // with the chapter text, so every word is individually look-up-able
  // instead of matching one fixed keyword.
  const renderText = (text: string) => {
    const parts = text.split(WORD_PATTERN)
    return parts.map((part, i) => {
      if (!part) return null
      if (!WORD_PATTERN.test(part)) return <span key={i}>{part}</span>
      return (
        <span
          key={i}
          {...getHandlers(part, text)}
          className="cursor-pointer rounded-sm transition-colors hover:bg-primary-100"
        >
          {part}
        </span>
      )
    })
  }

  return (
    <div
      className={`flex flex-col gap-3 ${prefs.nightMode ? 'text-neutral-200' : 'text-neutral-800'}`}
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
            {renderText(block.text)}
          </p>
        ),
      )}
    </div>
  )
}

export default ReaderContentBlocks
