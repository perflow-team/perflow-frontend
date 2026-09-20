import { api } from '@/shared/api/base'

interface SendChatMessageParams {
  novelId: string
  message: string
  currentChapterNumber: number
  progress: number
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
    progress_percentage: progress,
  })
  return data
}
