import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import Header from '@/widgets/header/ui/Header'
import Button from '@/shared/ui/Button'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'

function NotFoundPage() {
  useDocumentTitle('페이지를 찾을 수 없어요')

  return (
    <div className="min-h-svh bg-white pt-14 md:pt-16">
      <Header />
      <section className="mx-auto flex max-w-[1168px] flex-col items-center gap-3 px-4 py-24 text-center md:px-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <Compass size={20} />
        </div>
        <h1 className="mt-1 text-title-large font-bold text-neutral-900 sm:text-headline-small">
          페이지를 찾을 수 없어요
        </h1>
        <p className="text-body-medium text-neutral-500">
          주소가 잘못되었거나 삭제된 페이지예요.
        </p>
        <Link to="/" className="mt-2">
          <Button>홈으로 돌아가기</Button>
        </Link>
      </section>
    </div>
  )
}

export default NotFoundPage
