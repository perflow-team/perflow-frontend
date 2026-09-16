import { useCallback, useState } from 'react'
import { sendChatMessage } from '@/features/ask-chatbot/api/chatApi'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  contextUsed?: string
  error?: boolean
}

interface UseChatParams {
  novelId: string
  episodeId: string
}

// POST /api/ai/chat/{novelId}/message returns a single JSON response (no
// SSE/streaming in this API version), so this is a plain request/response
// flow rather than an incremental stream.
export function useChat({ novelId, episodeId }: UseChatParams) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isSending, setIsSending] = useState(false)

  const sendMessage = useCallback(
    async (question: string) => {
      const progress = useReaderStore.getState().progress
      const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: question }
      setMessages((prev) => [...prev, userMessage])
      setIsSending(true)

      try {
        const { reply, context_used } = await sendChatMessage({
          novelId,
          message: question,
          currentChapterNumber: Number(episodeId),
          progress,
        })
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: reply, contextUsed: context_used },
        ])
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: '답변을 가져오지 못했어요. 다시 시도해 주세요.', error: true },
        ])
      } finally {
        setIsSending(false)
      }
    },
    [novelId, episodeId],
  )

  return { messages, sendMessage, isSending }
}
