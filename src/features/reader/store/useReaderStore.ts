import { create } from 'zustand'

interface ReaderState {
  mode: 'scroll' | 'paginated'
  progress: number // 0 ~ 1, 두 모드 공통
  currentPage: number // paginated 모드에서만 사용
  totalPages: number
  setMode: (mode: ReaderState['mode']) => void
  setProgress: (progress: number) => void
  setCurrentPage: (page: number) => void
  setTotalPages: (total: number) => void
}

export const useReaderStore = create<ReaderState>((set) => ({
  mode: 'scroll',
  progress: 0,
  currentPage: 1,
  totalPages: 1,
  setMode: (mode) => set({ mode }),
  setProgress: (progress) => set({ progress: Math.min(1, Math.max(0, progress)) }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setTotalPages: (totalPages) => set({ totalPages }),
}))
