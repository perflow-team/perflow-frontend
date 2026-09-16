import { api } from '@/shared/api/base'

interface SendChatMessageParams {
  novelId: string
  message: string
  currentChapterNumber: number
  progress: number // internal 0~1 scale
}

interface ChatMessageResponse {
  reply: string
  context_used: string
}

export async function sendChatMessage({
  novelId,
  message,
  currentChapterNumber,
  progress,
}: SendChatMessageParams): Promise<ChatMessageResponse> {
  const { data } = await api.post<ChatMessageResponse>(`/api/ai/chat/${novelId}/message`, {
    message,
    current_chapter_number: currentChapterNumber,
    progress_percentage: progress, // 0~1, unified across all endpoints per updated spec
  })
  return data
}
