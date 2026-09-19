import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { fetchProgress } from '@/entities/reading-progress/api/progressApi'
import Button from '@/shared/ui/Button'
import Modal from '@/shared/ui/Modal'
import { useAssistPanelStore } from '@/entities/assist-panel/model/useAssistPanelStore'

interface ResumeSummaryModalProps {
  novelId: string
  episodeId: string
  onResume: (progress: number) => void
  onRestart: () => void
}

const MIN_DAYS_SINCE_VISIT = 1

function ResumeSummaryModal({ novelId, episodeId, onResume, onRestart }: ResumeSummaryModalProps) {
  const [entry] = useState(() => ({ episodeId, visitedAt: Date.now() }))
  const dismissed = useAssistPanelStore((s) => s.resumeSummaryDismissed)
  const dismissResumeSummary = useAssistPanelStore((s) => s.dismissResumeSummary)

  const { data } = useQuery({
    queryKey: ['progress', novelId],
    queryFn: () => fetchProgress(novelId),
    retry: false,
  })

  if (!data || dismissed || !data.updated_at) return null

  const daysSinceLastVisit = (entry.visitedAt - new Date(data.updated_at).getTime()) / (1000 * 60 * 60 * 24)
  const visitedOtherEpisodeSince = data.current_chapter_number !== Number(entry.episodeId)
  const shouldShow = daysSinceLastVisit >= MIN_DAYS_SINCE_VISIT || visitedOtherEpisodeSince

  if (!shouldShow) return null

  return (
    <Modal onClose={dismissResumeSummary} widthClassName="max-w-md">
      <div className="p-5">
        <p className="text-title-small font-semibold text-neutral-900">다시 오신 걸 환영해요</p>
        <p className="mt-2 text-body-small text-neutral-600">
          {data.current_chapter_number}화, {Math.round(data.progress_percentage * 100)}% 지점까지 읽으셨어요.
        </p>
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
              onResume(data.progress_percentage)
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
