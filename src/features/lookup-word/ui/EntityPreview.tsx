import { createPortal } from 'react-dom'
import { useEntityCard } from '../model/useEntityCard'

export interface PreviewTarget {
  word: string
  contextSentence: string
  currentCharOffset: number
  selectionCharOffset?: number
  rect: DOMRect
}

export function EntityPreview({ target, novelId, episodeId, onEnter, onLeave }: {
  target: PreviewTarget
  novelId: string
  episodeId: string
  onEnter: () => void
  onLeave: () => void
}) {
  const { data, isPending, isError } = useEntityCard({ novelId, episodeId, ...target })
  const width = Math.min(340, window.innerWidth - 24)
  const left = Math.max(12, Math.min(target.rect.left, window.innerWidth - width - 12))
  const below = target.rect.bottom + 280 < window.innerHeight
  return createPortal(
    <div role="tooltip" id="reader-word-preview" onPointerEnter={onEnter} onPointerLeave={onLeave}
      className="fixed z-50 max-h-64 overflow-y-auto rounded-xl border border-primary-100 bg-white p-4 text-neutral-800 shadow-xl"
      style={{ width, left, ...(below ? { top: target.rect.bottom + 8 } : { bottom: window.innerHeight - target.rect.top + 8 }) }}>
      <p className="text-title-small font-semibold">{data?.title ?? target.word}{data?.tag && <span className="ml-2 text-label-small text-neutral-400">{data.tag}</span>}</p>
      {isPending && <p className="mt-2 text-body-small text-neutral-500">설명을 불러오는 중이에요.</p>}
      {isError && <p className="mt-2 text-body-small text-neutral-500">설명을 가져오지 못했어요. 단어를 눌러 다시 확인해 주세요.</p>}
      {data?.fields.map((field, i) => <p key={i} className="mt-2 text-body-small"><span className="mr-2 font-medium text-neutral-500">{field.label}</span>{field.value}</p>)}
      {data?.isSpoilerFiltered && <p className="mt-2 text-label-small text-primary-600">현재 읽은 범위의 설명</p>}
    </div>, document.body,
  )
}
