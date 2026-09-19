import axios from 'axios'

type TokenGetter = () => string | null
type UnauthorizedHandler = () => void

let getToken: TokenGetter = () => null
let onUnauthorized: UnauthorizedHandler = () => {}

export function configureApiAuth(tokenGetter: TokenGetter, unauthorizedHandler: UnauthorizedHandler) {
  getToken = tokenGetter
  onUnauthorized = unauthorizedHandler
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://perflow-backend.onrender.com',
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      onUnauthorized()
    }
    return Promise.reject(error)
  },
)
