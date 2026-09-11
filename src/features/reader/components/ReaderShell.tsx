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
import AssistSidebar from '../../assist-panel/components/AssistSidebar'
import { useAssistPanelStore } from '../../assist-panel/store/useAssistPanelStore'
import ActionSheet, { type ActionSheetItem } from '../../../shared/ui/ActionSheet'
import Button from '../../../shared/ui/Button'
import { useReaderStore } from '../store/useReaderStore'

interface ReaderShellProps {
  novelId: string
  episodeId: string
  title: string
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
}

// Spec 2.1: Header (뒤로가기 · 회차 타이틀 · 설정(Aa) · 챗봇토글) + 본문/사이드바 좌우 분할
// + Footer (진행도 바 · 이전/다음 회차). 설정과 챗봇토글은 둘 다 항상 보이는 별도 아이콘.
function ReaderShell({
  novelId,
  episodeId,
  title,
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
}: ReaderShellProps) {
  const navigate = useNavigate()
  const progress = useReaderStore((s) => s.progress)
  const mode = useReaderStore((s) => s.mode)
  const setMode = useReaderStore((s) => s.setMode)
  const activePanel = useAssistPanelStore((s) => s.activePanel)
  const setActivePanel = useAssistPanelStore((s) => s.setActivePanel)

  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

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
      label: '야간 모드',
      onClick: onToggleNightMode,
    },
  ]

  return (
    <div className={`flex h-svh flex-col ${nightMode ? 'bg-neutral-950' : 'bg-white'}`}>
      <header className="relative z-30 flex h-14 shrink-0 items-center justify-between bg-neutral-900 px-4 text-white">
        <button
          type="button"
          onClick={() => navigate(`/novel/${novelId}`)}
          aria-label="뒤로 가기"
          className="rounded-full p-2 hover:bg-neutral-800"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-title-medium font-medium">{title}</h1>

        <div className="flex items-center gap-1">
          <div className="relative" ref={settingsRef}>
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              aria-label="읽기 설정"
              className="rounded-full p-2 hover:bg-neutral-800"
            >
              <Settings size={20} />
            </button>
            <ActionSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} items={settingsItems} />
          </div>

          <button
            type="button"
            onClick={() => setActivePanel(activePanel === 'closed' ? 'chat' : 'closed')}
            aria-label="챗봇 토글"
            className={`rounded-full p-2 hover:bg-neutral-800 ${activePanel !== 'closed' ? 'bg-neutral-800' : ''}`}
          >
            <MessageCircle size={20} />
          </button>
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
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

        <main className="min-w-0 flex-1">{children}</main>

        <AssistSidebar novelId={novelId} episodeId={episodeId} />
      </div>

      <footer className="shrink-0 border-t border-neutral-200">
        <div className="h-1 w-full bg-neutral-200">
          <div className="h-full bg-primary-600 transition-all duration-300" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="flex items-center justify-between px-4 py-2">
          <Button variant="ghost" size="sm" onClick={onPrevEpisode}>
            이전 회차
          </Button>
          <span className="text-label-medium text-neutral-500">{Math.round(progress * 100)}%</span>
          <Button variant="ghost" size="sm" onClick={onNextEpisode}>
            다음 회차
          </Button>
        </div>
      </footer>
    </div>
  )
}

export default ReaderShell
