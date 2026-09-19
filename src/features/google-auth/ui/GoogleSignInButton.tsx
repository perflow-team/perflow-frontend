import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithGoogle } from '@/features/google-auth/api/authApi'
import { useAuthStore } from '@/entities/user/model/useAuthStore'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (parent: HTMLElement, options: { theme?: string; size?: string; width?: number }) => void
        }
      }
    }
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

function GoogleSignInButton() {
  const buttonRef = useRef<HTMLDivElement>(null)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !buttonRef.current) return

    const handleCredentialResponse = async (response: { credential: string }) => {
      try {
        const { access_token, user_info } = await loginWithGoogle(response.credential)
        setAuth(access_token, user_info)
        navigate('/')
      } catch {
        setError('로그인에 실패했어요. 다시 시도해 주세요.')
      }
    }

    const renderButton = () => {
      if (!window.google || !buttonRef.current) return
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredentialResponse })
      window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large', width: 240 })
    }

    if (window.google) {
      renderButton()
      return
    }

    const script = document.createElement('script')
    script.src = GSI_SCRIPT_SRC
    script.async = true
    script.onload = renderButton
    document.head.appendChild(script)
  }, [setAuth, navigate])

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="flex w-full flex-col gap-1.5">
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-md border border-neutral-300 py-2.5 text-label-large font-medium text-neutral-400"
        >
          Google로 계속하기
        </button>
        <p className="text-center text-label-small text-neutral-400">
          VITE_GOOGLE_CLIENT_ID 설정 후 사용할 수 있어요
        </p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div ref={buttonRef} className="flex w-full justify-center" />
      {error && <p className="text-center text-label-small text-error-700">{error}</p>}
    </div>
  )
}

export default GoogleSignInButton
