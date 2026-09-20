import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { NovelDetail } from '@/entities/novel/api/novelApi'
import { useToggleLike } from '@/entities/novel/lib/useToggleLike'
import Button from '@/shared/ui/Button'

export default function NovelLikeButton({ novel, userId }: { novel: NovelDetail; userId: number | null }) {
  const { liked, count, toggle, isPending, isError } = useToggleLike(novel.id, novel.likes)
  const label = <span aria-live="polite">좋아요 {count.toLocaleString('ko-KR')}</span>
  if (userId === null) {
    return <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-md border border-neutral-300 px-6 py-3 text-label-large font-medium text-neutral-700 hover:border-primary-400 hover:text-primary-700" aria-label={`좋아요 ${count.toLocaleString('ko-KR')}개, 로그인하여 좋아요 누르기`}><Heart size={16} />{label}</Link>
  }
  return <div className="flex flex-col gap-2">
    <Button variant="outline" aria-pressed={liked} aria-busy={isPending}
      title={liked ? '좋아요 취소 · 관심작에서 삭제' : '좋아요 · 관심작에 저장'}
      disabled={isPending} onClick={toggle}>
      <Heart size={16} className={liked ? 'fill-primary-600 text-primary-600' : ''} />{label}
    </Button>
    {isError && <p role="alert" className="text-label-small text-neutral-600">좋아요를 처리하지 못했어요. 다시 눌러주세요.</p>}
  </div>
}
