import { create } from 'zustand'
import { sendChatMessage } from '../api/chatApi'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  contextUsed?: string
  error?: boolean
}

interface SendMessageParams {
  novelId: string
  episodeId: string
  question: string
}

interface ChatStoreState {
  messages: ChatMessage[]
  isSending: boolean
  sendMessage: (params: SendMessageParams) => Promise<void>
}

// Lives outside the ChatSidebar component on purpose: the sidebar unmounts
// whenever the reader switches to another tab (용어사전/관계도), and a
// component-local useState would lose the conversation on every switch.
export const useChatStore = create<ChatStoreState>((set) => ({
  messages: [],
  isSending: false,
  sendMessage: async ({ novelId, episodeId, question }) => {
    const progress = useReaderStore.getState().progress
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: question }
    set((state) => ({ messages: [...state.messages, userMessage], isSending: true }))

    try {
      const { reply, context_used } = await sendChatMessage({
        novelId,
        message: question,
        currentChapterNumber: Number(episodeId),
        progress,
      })
      set((state) => ({
        messages: [
          ...state.messages,
          { id: crypto.randomUUID(), role: 'assistant', content: reply, contextUsed: context_used },
        ],
      }))
    } catch {
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: '답변을 가져오지 못했어요. 다시 시도해 주세요.',
            error: true,
          },
        ],
      }))
    } finally {
      set({ isSending: false })
    }
  },
}))
