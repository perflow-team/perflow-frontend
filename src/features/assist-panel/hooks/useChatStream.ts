import { useCallback, useRef, useState } from 'react'
import { useReaderStore } from '../../reader/store/useReaderStore'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

interface UseChatStreamParams {
  novelId: string
  episodeId: string
}

function buildMockAnswer(question: string, progressPercent: number) {
  return `${progressPercent}% 지점까지 읽으신 내용을 기준으로 답변드릴게요. "${question}"에 대해서는 — 지금까지 등장한 흐름 안에서 볼 때, 꽃은 어린 왕자에게 조금씩 특별한 의미가 되어가고 있어요. 아직 읽지 않으신 뒷부분은 스포일러가 되지 않도록 언급하지 않을게요.`
}

// Simulates SSE-style streaming by revealing the mock answer a few
// characters at a time. Payload shape mirrors the spec:
// { novelId, episodeId, progress, question }
export function useChatStream({ novelId, episodeId }: UseChatStreamParams) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const sendMessage = useCallback(
    (question: string) => {
      const progress = useReaderStore.getState().progress
      const progressPercent = Math.round(progress * 100)
      void novelId
      void episodeId

      const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: question }
      const assistantId = crypto.randomUUID()
      setMessages((prev) => [...prev, userMessage, { id: assistantId, role: 'assistant', content: '', streaming: true }])
      setIsStreaming(true)

      const fullAnswer = buildMockAnswer(question, progressPercent)
      let cursor = 0
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        cursor += 4
        const chunk = fullAnswer.slice(0, cursor)
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: chunk } : m)))
        if (cursor >= fullAnswer.length) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m)))
          setIsStreaming(false)
        }
      }, 25)
    },
    [novelId, episodeId],
  )

  return { messages, sendMessage, isStreaming }
}
