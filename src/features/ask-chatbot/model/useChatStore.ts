import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { sendChatMessage } from '../api/chatApi'
import { useReaderStore } from '@/entities/reading-progress/model/useReaderStore'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  contextUsed?: string
  error?: boolean
}

export interface Conversation {
  messages: ChatMessage[]
  isSending: boolean
}

interface SendMessageParams {
  novelId: string
  episodeId: string
  userId: number | null
  question: string
}
interface ChatStoreState {
  conversations: Record<string, Conversation>
  sendMessage: (params: SendMessageParams) => Promise<void>
}

export const EMPTY_CONVERSATION: Conversation = { messages: [], isSending: false }
export const conversationKey = (novelId: string, userId: number | null) => JSON.stringify([userId ?? 'guest', novelId])

// Scope both pending requests and saved messages. A response always goes back
// to the book/account that sent it, even if navigation happened while waiting.
export const useChatStore = create<ChatStoreState>()(persist((set, get) => ({
  conversations: {},
  sendMessage: async ({ novelId, episodeId, userId, question }) => {
    const key = conversationKey(novelId, userId)
    if (!question.trim() || get().conversations[key]?.isSending) return
    const update = (change: (conversation: Conversation) => Conversation) => set(state => ({
      conversations: { ...state.conversations, [key]: change(state.conversations[key] ?? EMPTY_CONVERSATION) },
    }))
    update(conversation => ({
      messages: [...conversation.messages, { id: crypto.randomUUID(), role: 'user', content: question }],
      isSending: true,
    }))
    try {
      const { reply, context_used } = await sendChatMessage({
        novelId, message: question, currentChapterNumber: Number(episodeId), progress: useReaderStore.getState().progress,
      })
      update(conversation => ({ ...conversation, messages: [...conversation.messages,
        { id: crypto.randomUUID(), role: 'assistant', content: reply, contextUsed: context_used },
      ] }))
    } catch {
      update(conversation => ({ ...conversation, messages: [...conversation.messages,
        { id: crypto.randomUUID(), role: 'assistant', content: '답변을 가져오지 못했어요. 다시 시도해 주세요.', error: true },
      ] }))
    } finally {
      update(conversation => ({ ...conversation, isSending: false }))
    }
  },
}), {
  name: 'perflow-book-conversations',
  storage: createJSONStorage(() => ({
    getItem: (key) => { try { return localStorage.getItem(key) } catch { return null } },
    setItem: (key, value) => { try { localStorage.setItem(key, value) } catch { /* Keep this visit's messages in memory if storage is full. */ } },
    removeItem: (key) => { try { localStorage.removeItem(key) } catch { /* Storage may be disabled by the browser. */ } },
  })),
  partialize: state => ({ conversations: Object.fromEntries(Object.entries(state.conversations)
    .map(([key, conversation]) => [key, { messages: conversation.messages, isSending: false }])) }),
}))
