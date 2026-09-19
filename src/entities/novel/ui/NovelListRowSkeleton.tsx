import Skeleton from '@/shared/ui/Skeleton'

function NovelListRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-neutral-100 py-3 last:border-0">
      <Skeleton className="h-[84px] w-[62px] shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

export default NovelListRowSkeleton
