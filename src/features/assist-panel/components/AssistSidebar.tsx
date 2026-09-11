import { X } from 'lucide-react'
import { useAssistPanelStore } from '../store/useAssistPanelStore'
import ChatSidebar from './ChatSidebar'
import TermDictionary from './TermDictionary'

interface AssistSidebarProps {
  novelId: string
  episodeId: string
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-label-medium font-medium transition ${
        active ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
      }`}
    >
      {children}
    </button>
  )
}

// Spec 2.1 / 6: PC(>=1024px)에서는 우측에 상시 고정되는 320px 사이드바,
// 모바일/태블릿(<1024px)에서는 하단 바텀시트로 전환. activePanel 하나로
// 열림/닫힘과 챗봇·용어사전 탭 전환을 함께 제어한다 (useAssistPanelStore).
function AssistSidebar({ novelId, episodeId }: AssistSidebarProps) {
  const activePanel = useAssistPanelStore((s) => s.activePanel)
  const setActivePanel = useAssistPanelStore((s) => s.setActivePanel)

  if (activePanel === 'closed') return null

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-neutral-900/40 lg:hidden"
        onClick={() => setActivePanel('closed')}
        role="presentation"
      />
      <aside className="fixed inset-x-0 bottom-0 z-40 flex h-[70vh] flex-col rounded-t-2xl bg-white shadow-2xl lg:static lg:h-full lg:w-80 lg:shrink-0 lg:rounded-none lg:border-l lg:border-neutral-200 lg:shadow-none">
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-3 py-2">
          <div className="flex gap-1 rounded-lg bg-neutral-100 p-1">
            <TabButton active={activePanel === 'chat'} onClick={() => setActivePanel('chat')}>
              챗봇
            </TabButton>
            <TabButton active={activePanel === 'dictionary'} onClick={() => setActivePanel('dictionary')}>
              용어사전
            </TabButton>
          </div>
          <button
            type="button"
            onClick={() => setActivePanel('closed')}
            aria-label="패널 닫기"
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1">
          {activePanel === 'chat' ? (
            <ChatSidebar novelId={novelId} episodeId={episodeId} />
          ) : (
            <TermDictionary novelId={novelId} />
          )}
        </div>
      </aside>
    </>
  )
}

export default AssistSidebar
