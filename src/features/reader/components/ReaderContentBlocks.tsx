import { ENTITY_KEYWORD, type ContentBlock } from '../../../shared/api/mockData'
import { useEntityTrigger } from '../hooks/useEntityTrigger'

export interface ReaderPrefs {
  fontSizeRem: number
  lineHeight: number
  fontFamily: 'sans' | 'serif'
  nightMode: boolean
}

interface ReaderContentBlocksProps {
  content: ContentBlock[]
  prefs: ReaderPrefs
  onEntityTrigger: (entityId: string) => void
}

function ReaderContentBlocks({ content, prefs, onEntityTrigger }: ReaderContentBlocksProps) {
  const { getHandlers } = useEntityTrigger(onEntityTrigger)

  const renderText = (text: string) => {
    const parts = text.split(ENTITY_KEYWORD)
    return parts.map((part, i) => (
      <span key={i}>
        {part}
        {i < parts.length - 1 && (
          <span
            data-entity-id="rose"
            {...getHandlers('rose')}
            className="cursor-pointer rounded-sm underline decoration-primary-400 decoration-dotted underline-offset-4 hover:bg-primary-100"
          >
            {ENTITY_KEYWORD}
          </span>
        )}
      </span>
    ))
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
