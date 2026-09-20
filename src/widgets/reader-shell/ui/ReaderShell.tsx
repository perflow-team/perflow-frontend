import {
  AlignJustify,
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Maximize2,
  Minimize2,
  Moon,
  RotateCcw,
  ScrollText,
  Settings,
  Sun,
  Type,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AssistSidebar from '@/widgets/assist-sidebar/ui/AssistSidebar'
import { useAssistPanelStore } from '@/entities/assist-panel/model/useAssistPanelStore'
import ActionSheet, { type ActionSheetItem } from '@/shared/ui/ActionSheet'
import Button from '@/shared/ui/Button'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'

interface ReaderShellProps {
  novelId: string
  episodeId: string
  title: string
  lookupStatus: 'preparing' | 'completed' | 'failed' | 'not_prepared'
  children: ReactNode
  nightMode: boolean
  fontFamily: 'sans' | 'serif'
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onToggleNightMode: () => void
  onCycleLineSpacing: () => void
  onToggleFont: () => void
  onPrevPage: () => void
  onNextPage: () => void
  onPrevEpisode: () => void
  onNextEpisode: () => void
  hasPreviousEpisode: boolean
  hasNextEpisode: boolean
}

function ReaderShell({
  novelId,
  episodeId,
  title,
  lookupStatus,
  children,
  nightMode,
  fontFamily,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleNightMode,
  onCycleLineSpacing,
  onToggleFont,
  onPrevPage,
  onNextPage,
  onPrevEpisode,
  onNextEpisode,
  hasPreviousEpisode,
  hasNextEpisode,
}: ReaderShellProps) {
  const navigate = useNavigate()
  const progress = useReaderStore((s) => s.progress)
  const mode = useReaderStore((s) => s.mode)
  const setMode = useReaderStore((s) => s.setMode)
  const activePanel = useAssistPanelStore((s) => s.activePanel)
  const setActivePanel = useAssistPanelStore((s) => s.setActivePanel)

  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const assistButtonRef = useRef<HTMLButtonElement>(null)
  const closeAssistPanel = () => {
    setActivePanel('closed')
    requestAnimationFrame(() => assistButtonRef.current?.focus())
  }

  const settingsItems: ActionSheetItem[] = [
    { icon: <Maximize2 size={16} />, label: '확대', onClick: onZoomIn },
    { icon: <Minimize2 size={16} />, label: '축소', onClick: onZoomOut },
    { icon: <RotateCcw size={16} />, label: '원본 크기', onClick: onResetZoom },
    {
      icon: mode === 'scroll' ? <ScrollText size={16} /> : <BookOpen size={16} />,
      label: `넘기기 방식 전환 (${mode === 'scroll' ? '스크롤' : '페이지'})`,
      onClick: () => setMode(mode === 'scroll' ? 'paginated' : 'scroll'),
    },
    { icon: <AlignJustify size={16} />, label: '줄간격', onClick: onCycleLineSpacing },
    { icon: <Type size={16} />, label: `폰트 (${fontFamily === 'sans' ? '고딕' : '명조'})`, onClick: onToggleFont },
    {
      icon: nightMode ? <Sun size={16} /> : <Moon size={16} />,
      label: nightMode ? '라이트 모드로 전환' : '다크모드로 전환',
      onClick: onToggleNightMode,
    },
  ]

  return (
    <div className={`flex h-svh flex-col ${nightMode ? 'bg-neutral-900' : 'bg-white'}`}>
      <header className="relative z-50 flex h-14 shrink-0 items-center justify-between bg-primary-600 px-4 text-white">
        <button
          type="button"
          onClick={() => navigate(`/novel/${novelId}`)}
          aria-label="뒤로 가기"
          className="rounded-full p-2 hover:bg-primary-500"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="min-w-0 max-w-[55%] flex-1 truncate text-center text-title-medium font-medium sm:max-w-md">{title}</h1>

        <div className="flex items-center gap-1">
          <div className="relative" ref={settingsRef}>
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              aria-label="읽기 설정"
              className="rounded-full p-2 hover:bg-primary-500"
            >
              <Settings size={20} />
            </button>
            <ActionSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} items={settingsItems} />
          </div>

        </div>
      </header>

      <div className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-3 py-1.5 text-center text-label-small ${nightMode ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-50 text-neutral-500'}`}>
        <span>단어에 마우스를 올려 설명 보기 · 누르면 자세히 볼 수 있어요</span>
        {lookupStatus === 'preparing' && <span role="status">설명할 단어를 준비하고 있어요…</span>}
        {(lookupStatus === 'failed' || lookupStatus === 'not_prepared') && <span role="status">아직 준비되지 않은 설명이 있어요.</span>}
      </div>
      <div className="relative flex flex-1 overflow-hidden">
        {mode === 'paginated' && (
          <>
            <button
              type="button"
              onClick={onPrevPage}
              aria-label="이전 페이지"
              className={`absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full ${nightMode ? 'bg-white/5 text-neutral-400 hover:bg-white/10' : 'bg-neutral-900/5 text-neutral-500 hover:bg-neutral-900/10'}`}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={onNextPage}
              aria-label="다음 페이지"
              className={`absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full ${nightMode ? 'bg-white/5 text-neutral-400 hover:bg-white/10' : 'bg-neutral-900/5 text-neutral-500 hover:bg-neutral-900/10'}`}
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        <main className="relative min-w-0 flex-1">
          {children}
          <div className={`absolute bottom-5 right-5 z-20 lg:bottom-8 lg:right-[max(1.5rem,calc((100%-42rem)/2-6rem))] ${activePanel !== 'closed' ? 'hidden' : ''}`}>
            <button
              ref={assistButtonRef}
              type="button"
              onClick={() => setActivePanel('chat')}
              aria-label="독서 도우미 열기"
              aria-controls="reader-assist-panel"
              aria-expanded={activePanel !== 'closed'}
              className="group relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-900/20 outline-none transition-[background-color,transform,box-shadow] hover:bg-primary-500 hover:shadow-xl hover:shadow-primary-900/25 focus-visible:ring-4 focus-visible:ring-primary-400/40 focus-visible:ring-offset-4 active:scale-95 motion-reduce:transition-none lg:h-14 lg:w-14"
            >
              <MessageCircle aria-hidden="true" className="h-5 w-5 lg:h-6 lg:w-6" strokeWidth={2} />
              <span aria-hidden="true" className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-neutral-900 px-3 py-2 text-label-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">챗봇 · 키워드 · 관계도</span>
            </button>
          </div>
        </main>

        <AssistSidebar novelId={novelId} episodeId={episodeId} onClose={closeAssistPanel} />
      </div>

      <footer className="shrink-0 border-t border-neutral-200">
        <div className="h-1 w-full bg-neutral-200">
          <div className="h-full bg-primary-600 transition-all duration-300" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="flex items-center justify-between px-4 py-2">
          <Button variant="ghost" size="sm" onClick={onPrevEpisode} disabled={!hasPreviousEpisode}>
            이전 회차
          </Button>
          <span className="text-label-medium text-neutral-500">{Math.round(progress * 100)}%</span>
          <Button variant="ghost" size="sm" onClick={onNextEpisode} disabled={!hasNextEpisode}>
            다음 회차
          </Button>
        </div>
      </footer>
    </div>
  )
}

export default ReaderShell
