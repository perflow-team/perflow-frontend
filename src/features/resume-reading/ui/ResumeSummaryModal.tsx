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

// Spec 3.3: only appears when a last-read position exists AND enough time
// has passed (or the reader came back via another episode). Once dismissed,
// it stays dismissed for the rest of the session (see useAssistPanelStore).
//
// Note: GET /novels/{id}/progress only returns {current_chapter_number,
// progress_percentage, updated_at} — there's no summary-text endpoint yet,
// so this shows the real chapter/progress instead of a fabricated recap.
function ResumeSummaryModal({ novelId, episodeId, onResume, onRestart }: ResumeSummaryModalProps) {
  const [entry] = useState(() => ({ episodeId, visitedAt: Date.now() }))
  const dismissed = useAssistPanelStore((s) => s.resumeSummaryDismissed)
  const dismissResumeSummary = useAssistPanelStore((s) => s.dismissResumeSummary)

  const { data } = useQuery({
    queryKey: ['progress', novelId],
    queryFn: () => fetchProgress(novelId),
    retry: false,
  })

  // updated_at is null until the reader has actually saved progress once —
  // treat that as "no reading history yet" rather than "infinitely overdue".
  if (!data || dismissed || !data.updated_at) return null

  const daysSinceLastVisit = (entry.visitedAt - new Date(data.updated_at).getTime()) / (1000 * 60 * 60 * 24)
  // Only compare the chapter used to enter the reader. Ordinary next/previous
  // navigation is part of the same visit and must not reopen this overlay.
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
