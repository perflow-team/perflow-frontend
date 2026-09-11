import { SendHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Badge from '../../../shared/ui/Badge'
import { useReaderStore } from '../../reader/store/useReaderStore'
import { useChatStream } from '../hooks/useChatStream'

interface ChatSidebarProps {
  novelId: string
  episodeId: string
}

// Spec 3.2: the "진행도 N% 기준 답변" badge stays pinned at the top at all
// times — it's the trust signal that lets a reader ask questions without
// fear of being spoiled. Input fixed at bottom, messages stack upward.
function ChatSidebar({ novelId, episodeId }: ChatSidebarProps) {
  const progress = useReaderStore((s) => s.progress)
  const { messages, sendMessage, isStreaming } = useChatStream({ novelId, episodeId })
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const question = input.trim()
    if (!question || isStreaming) return
    sendMessage(question)
    setInput('')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200 px-4 py-3">
        <Badge tone="primary">진행도 {Math.round(progress * 100)}% 기준 답변</Badge>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-body-small text-neutral-400">
            지금까지 읽으신 내용 안에서만 답변해요. 궁금한 걸 편하게 물어보세요.
          </p>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-body-small ${
                message.role === 'user'
                  ? 'rounded-tr-sm bg-primary-600 text-white'
                  : 'rounded-tl-sm bg-neutral-100 text-neutral-800'
              }`}
            >
              {message.content}
              {message.streaming && <span className="ml-0.5 inline-block animate-pulse">▍</span>}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="shrink-0 border-t border-neutral-200 p-3">
        <div className="flex items-end gap-2 rounded-xl bg-neutral-100 p-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            placeholder="궁금한 걸 물어보세요"
            rows={1}
            className="max-h-24 flex-1 resize-none bg-transparent px-1.5 py-1 text-body-medium text-neutral-900 outline-none placeholder:text-neutral-400"
          />
          <button
            type="submit"
            aria-label="전송"
            disabled={!input.trim() || isStreaming}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-40"
          >
            <SendHorizontal size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatSidebar
