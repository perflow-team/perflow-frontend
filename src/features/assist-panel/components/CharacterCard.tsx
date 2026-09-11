import { X } from 'lucide-react'
import Badge from '../../../shared/ui/Badge'
import Modal from '../../../shared/ui/Modal'
import { useEntityCard } from '../hooks/useEntityCard'
import { useAssistPanelStore } from '../store/useAssistPanelStore'

interface CharacterCardProps {
  novelId: string
}

// Spec 3.1: modal overlay, identical on PC and mobile. Local UI state only
// (open/closed + target entityId) lives in useAssistPanelStore; the actual
// card content is server state fetched through useEntityCard.
function CharacterCard({ novelId }: CharacterCardProps) {
  const entityId = useAssistPanelStore((s) => s.characterCardEntityId)
  const closeCharacterCard = useAssistPanelStore((s) => s.closeCharacterCard)
  const { data, isLoading } = useEntityCard({ novelId, entityId })

  if (!entityId) return null

  return (
    <Modal onClose={closeCharacterCard} widthClassName="max-w-sm">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          {isLoading ? (
            <span className="text-body-medium text-neutral-500">불러오는 중...</span>
          ) : data ? (
            <div className="flex items-center gap-2">
              <span className="text-title-medium font-semibold text-neutral-900">{data.name}</span>
              <Badge>{data.type}</Badge>
            </div>
          ) : (
            <span className="text-body-medium text-neutral-500">아직 등장하지 않은 인물이에요.</span>
          )}

          <button
            type="button"
            onClick={closeCharacterCard}
            aria-label="닫기"
            className="shrink-0 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X size={18} />
          </button>
        </div>

        {data && (
          <>
            <Badge tone="primary" className="mt-3">
              현재 진행도까지만 표시
            </Badge>
            <div className="mt-3 space-y-3">
              {data.facts.map((fact) => (
                <div key={fact.label}>
                  <p className="text-label-medium font-medium text-neutral-500">{fact.label}</p>
                  <p className="text-body-small text-neutral-700">{fact.text}</p>
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
