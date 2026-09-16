import { Link } from 'react-router-dom'
import GoogleSignInButton from '@/features/google-auth/ui/GoogleSignInButton'

// The backend only exposes Google social login (POST /api/auth/google) —
// there is no email/password endpoint, so this page doesn't invent one.
function Login() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
        <Link to="/" className="text-title-large font-bold text-primary-700">
          perflow
        </Link>

        <h1 className="mt-6 text-headline-small text-neutral-900">로그인</h1>
        <p className="mt-1 text-body-medium text-neutral-500">
          구글 계정으로 로그인하고 이야기를 이어가세요
        </p>

        <div className="mt-6">
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  )
}

export default Login
