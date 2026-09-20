import { api } from '@/shared/api/base'

interface ProgressResponse {
  current_chapter_number: number
  current_char_offset: number
  progress_percentage: number
  updated_at: string | null
}

export async function fetchProgress(novelId: string): Promise<ProgressResponse> {
  const { data } = await api.get<ProgressResponse>(`/api/novels/${novelId}/progress`)
  return data
}

interface UpdateProgressParams {
  novelId: string
  currentChapterNumber: number
  currentCharOffset: number
  progress: number
}

export async function updateProgress({
  novelId,
  currentChapterNumber,
  currentCharOffset,
  progress,
}: UpdateProgressParams): Promise<void> {
  await api.put(`/api/novels/${novelId}/progress`, {
    current_chapter_number: currentChapterNumber,
    current_char_offset: currentCharOffset,
    progress_percentage: progress,
  }, { timeout: 10_000 })
}
