import axios from 'axios'
import { useAuthStore } from '@/entities/user/model/useAuthStore'

// Base URL for the Perflow backend (Supabase + OpenAI, per API Spec Cloud Native V4).
// Override with VITE_API_BASE_URL for local backend development.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://perflow-backend.onrender.com',
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  },
)
