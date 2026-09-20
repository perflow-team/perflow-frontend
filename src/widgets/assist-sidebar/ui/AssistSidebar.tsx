import { X } from 'lucide-react'
import { useAssistPanelStore } from '@/entities/assist-panel/model/useAssistPanelStore'
import ChatSidebar from '@/features/ask-chatbot/ui/ChatSidebar'
import CharacterRelationsGraph from '@/features/view-character-relations/ui/CharacterRelationsGraph'
import TermDictionary from '@/features/search-dictionary-terms/ui/TermDictionary'
import { useAuthStore } from '@/entities/user/model/useAuthStore'

interface AssistSidebarProps {
  novelId: string
  episodeId: string
  onClose: () => void
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
      role="tab"
      aria-selected={active}
      className={`cursor-pointer px-3 py-3 text-label-large transition-colors ${
        active ? 'border-b-2 border-primary-600 font-semibold text-primary-700' : 'text-neutral-500 hover:text-primary-700'
      }`}
    >
      {children}
    </button>
  )
}

function AssistSidebar({ novelId, episodeId, onClose }: AssistSidebarProps) {
  const activePanel = useAssistPanelStore((s) => s.activePanel)
  const setActivePanel = useAssistPanelStore((s) => s.setActivePanel)
  const userId = useAuthStore((s) => s.user?.id ?? 'guest')

  if (activePanel === 'closed') return null

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-neutral-900/40 lg:hidden"
        onClick={onClose}
        role="presentation"
      />
      <aside id="reader-assist-panel" aria-label="독서 도우미" onKeyDown={(event) => {
        if (event.key === 'Escape') { event.stopPropagation(); onClose() }
      }} className="fixed inset-x-0 bottom-0 z-40 flex h-[70dvh] flex-col rounded-t-2xl bg-white shadow-2xl lg:static lg:h-full lg:w-80 lg:shrink-0 lg:rounded-none lg:border-l lg:border-neutral-200 lg:shadow-none">
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 pl-1 pr-2">
          <div role="tablist" aria-label="독서 도우미 탭" className="flex gap-1">
            <TabButton active={activePanel === 'chat'} onClick={() => setActivePanel('chat')}>
              챗봇
            </TabButton>
            <TabButton active={activePanel === 'dictionary'} onClick={() => setActivePanel('dictionary')}>
              키워드
            </TabButton>
            <TabButton active={activePanel === 'relations'} onClick={() => setActivePanel('relations')}>
              관계도
            </TabButton>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="패널 닫기"
            autoFocus
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1">
          {activePanel === 'chat' && <ChatSidebar key={`${userId}:${novelId}`} novelId={novelId} episodeId={episodeId} />}
          {activePanel === 'dictionary' && <TermDictionary novelId={novelId} episodeId={episodeId} />}
          {activePanel === 'relations' && <CharacterRelationsGraph key={`${novelId}:${episodeId}`} novelId={novelId} episodeId={episodeId} />}
        </div>
      </aside>
    </>
  )
}

export default AssistSidebar
