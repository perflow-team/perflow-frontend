import { useCallback } from 'react'
import { conversationKey, EMPTY_CONVERSATION, useChatStore } from './useChatStore'
import { useAuthStore } from '@/entities/user/model/useAuthStore'

export type { ChatMessage } from './useChatStore'

interface UseChatParams {
  novelId: string
  episodeId: string
}

export function useChat({ novelId, episodeId }: UseChatParams) {
  const userId = useAuthStore((s) => s.user?.id ?? null)
  const key = conversationKey(novelId, userId)
  const { messages, isSending } = useChatStore((s) => s.conversations[key] ?? EMPTY_CONVERSATION)
  const sendMessageAction = useChatStore((s) => s.sendMessage)

  const sendMessage = useCallback(
    (question: string) => sendMessageAction({ novelId, episodeId, userId, question }),
    [novelId, episodeId, userId, sendMessageAction],
  )

  return { messages, sendMessage, isSending }
}
