import { useCallback } from 'react'
import { useChatStore } from './useChatStore'

export type { ChatMessage } from './useChatStore'

interface UseChatParams {
  novelId: string
  episodeId: string
}

// POST /api/ai/chat/{novelId}/message returns a single JSON response (no
// SSE/streaming in this API version), so this is a plain request/response
// flow rather than an incremental stream. Thin wrapper around useChatStore
// so the conversation survives the sidebar unmounting on tab switches.
export function useChat({ novelId, episodeId }: UseChatParams) {
  const messages = useChatStore((s) => s.messages)
  const isSending = useChatStore((s) => s.isSending)
  const sendMessageAction = useChatStore((s) => s.sendMessage)

  const sendMessage = useCallback(
    (question: string) => sendMessageAction({ novelId, episodeId, question }),
    [novelId, episodeId, sendMessageAction],
  )

  return { messages, sendMessage, isSending }
}
