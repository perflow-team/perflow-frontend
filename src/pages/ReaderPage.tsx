import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CharacterCard from '../features/assist-panel/components/CharacterCard'
import ResumeSummaryModal from '../features/assist-panel/components/ResumeSummaryModal'
import { useAssistPanelStore } from '../features/assist-panel/store/useAssistPanelStore'
import PaginatedReader from '../features/reader/components/PaginatedReader'
import type { ReaderHandle } from '../features/reader/components/ReaderHandle'
import ReaderShell from '../features/reader/components/ReaderShell'
import ScrollReader from '../features/reader/components/ScrollReader'
import { useReaderProgress } from '../features/reader/hooks/useReaderProgress'
import { useReaderStore } from '../features/reader/store/useReaderStore'
import { READER_CONTENT } from '../shared/api/mockData'

const ZOOM_STEPS = [0.85, 1, 1.15, 1.3, 1.45, 1.6]
const LINE_SPACINGS = [1.8, 2.2, 2.6]
const TOTAL_EPISODES = 12

function ReaderPage() {
  const { novelId = '1', episodeId = '1' } = useParams()
  const navigate = useNavigate()
  const readerRef = useRef<ReaderHandle>(null)

  const mode = useReaderStore((s) => s.mode)
  const openCharacterCard = useAssistPanelStore((s) => s.openCharacterCard)

  const [zoomIndex, setZoomIndex] = useState(1)
  const [lineSpacingIndex, setLineSpacingIndex] = useState(0)
  const [nightMode, setNightMode] = useState(false)
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif'>('sans')

  useReaderProgress({ novelId, episodeId })

  const goToEpisode = (delta: number) => {
    const next = Math.min(TOTAL_EPISODES, Math.max(1, Number(episodeId) + delta))
    navigate(`/novel/${novelId}/read/${next}`)
  }

  const prefs = {
    fontSizeRem: ZOOM_STEPS[zoomIndex],
    lineHeight: LINE_SPACINGS[lineSpacingIndex],
    fontFamily,
    nightMode,
  }

  return (
    <>
      <ReaderShell
        novelId={novelId}
        episodeId={episodeId}
        title="어린 왕자"
        nightMode={nightMode}
        fontFamily={fontFamily}
        onZoomIn={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
        onZoomOut={() => setZoomIndex((i) => Math.max(0, i - 1))}
        onResetZoom={() => setZoomIndex(1)}
        onToggleNightMode={() => setNightMode((v) => !v)}
        onCycleLineSpacing={() => setLineSpacingIndex((i) => (i + 1) % LINE_SPACINGS.length)}
        onToggleFont={() => setFontFamily((v) => (v === 'sans' ? 'serif' : 'sans'))}
        onPrevPage={() => readerRef.current?.pageBackward()}
        onNextPage={() => readerRef.current?.pageForward()}
        onPrevEpisode={() => goToEpisode(-1)}
        onNextEpisode={() => goToEpisode(1)}
      >
        {mode === 'scroll' ? (
          <ScrollReader ref={readerRef} content={READER_CONTENT} prefs={prefs} onEntityTrigger={openCharacterCard} />
        ) : (
          <PaginatedReader
            ref={readerRef}
            content={READER_CONTENT}
            prefs={prefs}
            onEntityTrigger={openCharacterCard}
          />
        )}
      </ReaderShell>

      <CharacterCard novelId={novelId} />

      <ResumeSummaryModal
        novelId={novelId}
        episodeId={episodeId}
        onResume={(progress) => readerRef.current?.jumpToProgress(progress)}
        onRestart={() => readerRef.current?.jumpToProgress(0)}
      />
    </>
  )
}

export default ReaderPage
