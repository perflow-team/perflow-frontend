import { useQuery } from '@tanstack/react-query'
import { fetchLastReadState } from '../../../shared/api/progress'
import Button from '../../../shared/ui/Button'
import Modal from '../../../shared/ui/Modal'
import { useAssistPanelStore } from '../store/useAssistPanelStore'

interface ResumeSummaryModalProps {
  novelId: string
  episodeId: string
  onResume: (progress: number) => void
  onRestart: () => void
}

// Spec 3.3: only appears when a last-read position exists AND enough time
// has passed (or the reader came back via another episode). Once dismissed,
// it stays dismissed for the rest of the session (see useAssistPanelStore).
function ResumeSummaryModal({ novelId, episodeId, onResume, onRestart }: ResumeSummaryModalProps) {
  const dismissed = useAssistPanelStore((s) => s.resumeSummaryDismissed)
  const dismissResumeSummary = useAssistPanelStore((s) => s.dismissResumeSummary)

  const { data } = useQuery({
    queryKey: ['last-read', novelId, episodeId],
    queryFn: () => fetchLastReadState({ novelId, episodeId }),
  })

  const shouldShow = !dismissed && data != null && (data.daysSinceLastVisit >= 1 || data.visitedOtherEpisodeSince)

  if (!shouldShow || !data) return null

  return (
    <Modal onClose={dismissResumeSummary} widthClassName="max-w-md">
      <div className="p-5">
        <p className="text-title-small font-semibold text-neutral-900">다시 오신 걸 환영해요</p>
        <ul className="mt-3 space-y-1.5 text-body-small text-neutral-600">
          {data.summaryLines.map((line, i) => (
            <li key={i}>· {line}</li>
          ))}
        </ul>
        <div className="mt-5 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              onRestart()
              dismissResumeSummary()
            }}
          >
            처음부터
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => {
              onResume(data.progress)
              dismissResumeSummary()
            }}
          >
            이어보기
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ResumeSummaryModal
