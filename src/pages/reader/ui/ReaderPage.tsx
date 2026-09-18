import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CharacterCard from '@/features/lookup-word/ui/CharacterCard'
import ResumeSummaryModal from '@/features/resume-reading/ui/ResumeSummaryModal'
import { useAssistPanelStore } from '@/entities/assist-panel/model/useAssistPanelStore'
import PaginatedReader from '@/features/switch-reader-mode/ui/PaginatedReader'
import type { ReaderHandle } from '@/features/switch-reader-mode/lib/ReaderHandle'
import ReaderShell from '@/widgets/reader-shell/ui/ReaderShell'
import ScrollReader from '@/features/switch-reader-mode/ui/ScrollReader'
import { useReaderProgress } from '@/features/track-reading-progress/model/useReaderProgress'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'
import { parseChapterContent } from '@/entities/chapter/lib/parseChapterContent'
import { fetchChapterContent, fetchChapters } from '@/entities/chapter/api/chapterApi'
import Skeleton from '@/shared/ui/Skeleton'
import { useLookupTargets } from '@/features/lookup-word/model/useLookupTargets'

const ZOOM_STEPS = [0.85, 1, 1.15, 1.3, 1.45, 1.6]
const LINE_SPACINGS = [1.8, 2.2, 2.6]

function ReaderPage() {
  const { novelId = '1', episodeId = '1' } = useParams()
  const navigate = useNavigate()
  const readerRef = useRef<ReaderHandle>(null)

  const mode = useReaderStore((s) => s.mode)
  const openCharacterCard = useAssistPanelStore((s) => s.openCharacterCard)
  const openLookup = useCallback((word: string, context: string, offset: number) => openCharacterCard(word, context, `${novelId}:${episodeId}`, offset), [openCharacterCard, novelId, episodeId])

  const [zoomIndex, setZoomIndex] = useState(1)
  const [lineSpacingIndex, setLineSpacingIndex] = useState(0)
  const [nightMode, setNightMode] = useState(false)
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif'>('sans')

  const { data: chapters } = useQuery({
    queryKey: ['chapters', novelId],
    queryFn: () => fetchChapters(novelId),
  })

  const {
    data: chapter,
    isLoading: chapterLoading,
    isError: chapterError,
  } = useQuery({
    queryKey: ['chapter-content', novelId, episodeId],
    queryFn: () => fetchChapterContent(novelId, Number(episodeId)),
  })

  const content = useMemo(() => (chapter ? parseChapterContent(chapter.content) : []), [chapter])
  const lookup = useLookupTargets(novelId, episodeId, !!chapter)
  const entities = lookup.data?.targets ?? []
  const totalChars = chapter?.content.length ?? 0

  useReaderProgress({ novelId, episodeId, totalChars })

  const goToEpisode = (delta: number) => {
    if (!chapters || chapters.length === 0) return
    const sorted = [...chapters].sort((a, b) => a.chapter_number - b.chapter_number)
    const currentIndex = sorted.findIndex((c) => c.chapter_number === Number(episodeId))
    const nextIndex = currentIndex + delta
    if (nextIndex < 0 || nextIndex >= sorted.length) return
    navigate(`/novel/${novelId}/read/${sorted[nextIndex].chapter_number}`)
  }

  const prefs = {
    fontSizeRem: ZOOM_STEPS[zoomIndex],
    lineHeight: LINE_SPACINGS[lineSpacingIndex],
    fontFamily,
    nightMode,
  }

  const title = chapter?.title ?? `${episodeId}화`

  return (
    <>
      <ReaderShell
        novelId={novelId}
        episodeId={episodeId}
        title={title}
        lookupStatus={lookup.isError || lookup.data?.status === 'failed' ? 'failed' : lookup.data?.status ?? 'preparing'}
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
        {chapterLoading && (
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-6 py-10 lg:px-16">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        )}
        {chapterError && (
          <div className="flex h-full items-center justify-center text-body-medium text-neutral-400">
            이 회차를 가져오지 못했어요.
          </div>
        )}
        {chapter &&
          (mode === 'scroll' ? (
            <ScrollReader
              key={`${novelId}:${episodeId}`}
              ref={readerRef}
              content={content}
              entities={entities}
              prefs={prefs}
              scope={`${novelId}:${episodeId}`}
              onEntityTrigger={openLookup}
            />
          ) : (
            <PaginatedReader
              key={`${novelId}:${episodeId}`}
              ref={readerRef}
              content={content}
              entities={entities}
              prefs={prefs}
              scope={`${novelId}:${episodeId}`}
              onEntityTrigger={openLookup}
            />
          ))}
      </ReaderShell>

      <CharacterCard novelId={novelId} episodeId={episodeId} />

      <ResumeSummaryModal
        key={novelId}
        novelId={novelId}
        episodeId={episodeId}
        onResume={(progress) => readerRef.current?.jumpToProgress(progress)}
        onRestart={() => readerRef.current?.jumpToProgress(0)}
      />
    </>
  )
}

export default ReaderPage
