import { api } from '@/shared/api/base'
import type { UserInfo } from '@/entities/user/model/useAuthStore'

interface LoginWithGoogleResponse {
  access_token: string
  token_type: string
  user_info: UserInfo
}

export async function loginWithGoogle(googleIdToken: string): Promise<LoginWithGoogleResponse> {
  const { data } = await api.post<LoginWithGoogleResponse>('/api/auth/google', {
    google_id_token: googleIdToken,
  })
  return data
}
