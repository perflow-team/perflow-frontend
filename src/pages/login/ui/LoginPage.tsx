import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import GoogleSignInButton from '@/features/google-auth/ui/GoogleSignInButton'
import NovelCoverCollage from '@/entities/novel/ui/NovelCoverCollage'
import NovelCoverPlaceholder from '@/entities/novel/ui/NovelCoverPlaceholder'
import { fetchNovels } from '@/entities/novel/api/novelApi'
import wordmark from '@/shared/assets/images/wordmark.svg'
import WaveBackdrop from '@/shared/ui/WaveBackdrop'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'

function Login() {
  const { data: novels } = useQuery({ queryKey: ['novels'], queryFn: fetchNovels })

  useDocumentTitle('로그인')

  return (
    <div className="flex min-h-svh flex-col lg:grid lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary-900 p-12 lg:flex">
        <WaveBackdrop />

        <Link to="/" className="z-10 w-fit">
          <img src={wordmark} alt="perflow" className="h-9 w-auto" />
        </Link>

        <div className="z-10 flex flex-col items-center gap-8">
          {novels && <NovelCoverCollage novels={novels} className="w-full max-w-[280px]" />}
          <div className="flex max-w-xs flex-col items-center gap-2 text-center">
            <p className="text-title-large font-semibold text-white">다시 펼쳐도, 바로 빠질 수 있게</p>
            <p className="text-body-medium text-primary-200/80">
              딱 당신이 읽은 만큼만
              <br />
              이야기의 흐름을 타도록 도와드릴게요
            </p>
          </div>
        </div>

        <p className="z-10 text-label-medium text-primary-400">© 2026 Perflow</p>
      </div>

      <div className="relative flex min-h-[44dvh] flex-col items-center justify-center gap-4 overflow-hidden bg-primary-900 px-6 py-10 text-center lg:hidden">
        <WaveBackdrop />

        <Link to="/" className="z-10">
          <img src={wordmark} alt="perflow" className="h-9 w-auto" />
        </Link>

        {novels?.[0] && (
          <div className="z-10 aspect-[3/4] w-[72px] -rotate-3 overflow-hidden rounded-lg bg-primary-800 shadow-xl ring-1 ring-primary-700/60">
            {novels[0].cover_image_url ? (
              <img src={novels[0].cover_image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <NovelCoverPlaceholder id={novels[0].id} title={novels[0].title} author={novels[0].author} compact />
            )}
          </div>
        )}

        <div className="z-10 flex flex-col items-center gap-1">
          <p className="text-title-medium font-semibold text-white">다시 펼쳐도, 바로 빠질 수 있게</p>
          <p className="text-body-small text-primary-200/80">
            딱 당신이 읽은 만큼만 이야기의 흐름을 타도록 도와드릴게요
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-start gap-10 px-4 pb-10 pt-8 lg:justify-center lg:pb-16 lg:pt-16">
        <div className="w-full max-w-sm">
          <h1 className="text-title-large font-bold text-neutral-900 sm:text-headline-small">로그인</h1>
          <p className="mt-1 text-body-medium text-neutral-500">구글 계정으로 로그인하고 이야기를 이어가세요</p>

          <div className="mt-8">
            <GoogleSignInButton />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
