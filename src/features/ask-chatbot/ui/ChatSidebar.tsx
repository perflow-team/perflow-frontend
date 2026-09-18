import { SendHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Badge from '@/shared/ui/Badge'
import Skeleton from '@/shared/ui/Skeleton'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'
import { useChat } from '@/features/ask-chatbot/model/useChat'

interface ChatSidebarProps {
  novelId: string
  episodeId: string
}

// Spec 3.2: the "진행도 N% 기준 답변" badge stays pinned at the top at all
// times — it's the trust signal that lets a reader ask questions without
// fear of being spoiled. Input fixed at bottom, messages stack upward.
function ChatSidebar({ novelId, episodeId }: ChatSidebarProps) {
  const progress = useReaderStore((s) => s.progress)
  const { messages, sendMessage, isSending } = useChat({ novelId, episodeId })
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isSending])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const question = input.trim()
    if (!question || isSending) return
    sendMessage(question)
    setInput('')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200 px-4 py-3">
        <Badge tone="primary">진행도 {Math.round(progress * 100)}% 기준 답변</Badge>
        <p className="mt-1.5 text-label-small text-neutral-500">이 작품의 대화만 표시해요.</p>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-body-small text-neutral-400">
            지금까지 읽으신 내용 안에서만 답변해요. 궁금한 걸 편하게 물어보세요.
          </p>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%]">
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-body-small ${
                  message.role === 'user'
                    ? 'rounded-tr-sm bg-primary-600 text-white'
                    : `rounded-tl-sm ${message.error ? 'bg-error-100 text-error-700' : 'bg-neutral-100 text-neutral-800'}`
                }`}
              >
                {message.content}
              </div>
              {message.contextUsed && (
                <details className="mt-1 rounded-lg bg-neutral-50 px-3 py-2 text-label-small text-neutral-500">
                  <summary className="cursor-pointer select-none">참고한 원문 보기</summary>
                  <p className="mt-1 text-body-small text-neutral-600">{message.contextUsed}</p>
                </details>
              )}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="flex flex-col gap-2 rounded-2xl rounded-tl-sm bg-neutral-100 px-3.5 py-2.5">
              <Skeleton className="h-3 w-40 bg-neutral-300" />
              <Skeleton className="h-3 w-24 bg-neutral-300" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="shrink-0 border-t border-neutral-200 p-3">
        <div className="flex items-end gap-2 rounded-xl bg-neutral-100 p-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
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
            disabled={!input.trim() || isSending}
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
