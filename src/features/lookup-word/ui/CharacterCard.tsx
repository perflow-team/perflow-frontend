import { X } from 'lucide-react'
import Badge from '@/shared/ui/Badge'
import Modal from '@/shared/ui/Modal'
import Skeleton from '@/shared/ui/Skeleton'
import { useEntityCard } from '@/features/lookup-word/model/useEntityCard'
import { useAssistPanelStore } from '@/entities/assist-panel/model/useAssistPanelStore'

interface CharacterCardProps {
  novelId: string
  episodeId: string
}

function CharacterCard({ novelId, episodeId }: CharacterCardProps) {
  const word = useAssistPanelStore((s) => s.characterCardScope === `${novelId}:${episodeId}` ? s.characterCardEntityId : null)
  const contextSentence = useAssistPanelStore((s) => s.characterCardContext)
  const currentCharOffset = useAssistPanelStore((s) => s.characterCardOffset)
  const selectionCharOffset = useAssistPanelStore((s) => s.characterCardSelectionOffset)
  const closeCharacterCard = useAssistPanelStore((s) => s.closeCharacterCard)
  const { data, isLoading, isError, refetch } = useEntityCard({ novelId, episodeId, word, contextSentence, currentCharOffset, selectionCharOffset })

  if (!word) return null

  return (
    <Modal onClose={closeCharacterCard} widthClassName="max-w-sm">
      <div className="max-h-[85svh] overflow-y-auto p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-title-medium font-semibold text-neutral-900">{data?.title ?? word}</span>
            {data?.tag && <Badge>{data.tag}</Badge>}
          </div>

          <button
            type="button"
            onClick={closeCharacterCard}
            aria-label="닫기"
            className="shrink-0 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading && (
          <div className="mt-3 flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        )}
        {isError && <div className="mt-3 text-body-small text-neutral-500"><p>설명을 가져오지 못했어요.</p><button type="button" onClick={() => void refetch()} className="mt-2 text-primary-600">다시 시도</button></div>}

        {data && (
          <>
            {data.isSpoilerFiltered && (
              <Badge tone="primary" className="mt-3">
                현재 진행도까지만 표시
              </Badge>
            )}
            <div className="mt-3 space-y-3">
              {data.fields.length === 0 && (
                <p className="text-body-small text-neutral-500">현재 읽은 내용에서 확인할 수 있는 설명이 없어요.</p>
              )}
              {data.fields.map((field, index) => (
                <div key={`${field.label}-${index}`}>
                  <p className="text-label-medium font-medium text-neutral-500">{field.label}</p>
                  <p className="text-body-small text-neutral-700">{field.value}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default CharacterCard
