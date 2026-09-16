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

// Spec 3.1: modal overlay, identical on PC and mobile. Local UI state only
// (open/closed + target word/context) lives in useAssistPanelStore; the
// actual explanation is server state fetched through useEntityCard.
function CharacterCard({ novelId, episodeId }: CharacterCardProps) {
  const word = useAssistPanelStore((s) => s.characterCardEntityId)
  const contextSentence = useAssistPanelStore((s) => s.characterCardContext)
  const closeCharacterCard = useAssistPanelStore((s) => s.closeCharacterCard)
  const { data, isLoading, isError } = useEntityCard({ novelId, episodeId, word, contextSentence })

  if (!word) return null

  return (
    <Modal onClose={closeCharacterCard} widthClassName="max-w-sm">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-title-medium font-semibold text-neutral-900">{word}</span>
            <Badge>인물</Badge>
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
        {isError && <p className="mt-3 text-body-small text-neutral-500">설명을 가져오지 못했어요.</p>}

        {data && (
          <>
            {data.isSpoilerFiltered && (
              <Badge tone="primary" className="mt-3">
                현재 진행도까지만 표시
              </Badge>
            )}
            <p className="mt-3 text-body-small text-neutral-700">{data.explanation}</p>
          </>
        )}
      </div>
    </Modal>
  )
}

export default CharacterCard
