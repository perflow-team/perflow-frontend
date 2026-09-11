import { Link } from 'react-router-dom'
import Button from '../shared/ui/Button'

function Login() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-neutral-50">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <Link to="/" className="text-title-large font-bold text-primary-700">
          perflow
        </Link>

        <h1 className="mt-6 text-headline-small text-neutral-900">로그인</h1>
        <p className="mt-1 text-body-medium text-neutral-500">
          계정에 로그인하고 이야기를 이어가세요
        </p>

        <form className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-label-large text-neutral-700">이메일</span>
            <input
              type="email"
              placeholder="you@example.com"
              className="rounded-md border border-neutral-300 px-3 py-2 text-body-medium text-neutral-900 outline-none focus:border-primary-500"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-label-large text-neutral-700">비밀번호</span>
            <input
              type="password"
              placeholder="********"
              className="rounded-md border border-neutral-300 px-3 py-2 text-body-medium text-neutral-900 outline-none focus:border-primary-500"
            />
          </label>

          <div className="flex items-center justify-between text-label-medium text-neutral-500">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-neutral-300" />
              로그인 상태 유지
            </label>
            <a href="#" className="hover:text-primary-600">
              비밀번호 찾기
            </a>
          </div>

          <Button type="submit" className="mt-2 w-full">
            로그인
          </Button>
        </form>

        <p className="mt-6 text-center text-body-small text-neutral-500">
          아직 계정이 없으신가요?{' '}
          <a href="#" className="font-medium text-primary-600 hover:underline">
            회원가입
          </a>
        </p>
      </div>
    </div>
  )
}

export default Login
