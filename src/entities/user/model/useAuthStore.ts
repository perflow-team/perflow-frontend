import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface UserInfo {
  id: number
  nickname: string
  email: string
}

interface AuthState {
  accessToken: string | null
  user: UserInfo | null
  setAuth: (accessToken: string, user: UserInfo) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setAuth: (accessToken, user) => set({ accessToken, user }),
      logout: () => set({ accessToken: null, user: null }),
    }),
    {
      name: 'perflow-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
