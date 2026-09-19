import { isPlaceholderNovel } from '../lib/isPlaceholderNovel'
import NovelCoverPlaceholder from './NovelCoverPlaceholder'
import PreparingOverlay from './PreparingOverlay'

interface NovelCoverCollageProps {
  novels: { id: number; title: string; author: string; cover_image_url: string | null }[]
  className?: string
}

const COLLAGE_SLOTS = [
  'absolute left-[18%] top-[4%] z-30 w-[58%] -rotate-3',
  'absolute bottom-[2%] left-0 z-20 w-[42%] rotate-6',
  'absolute right-0 top-0 z-10 w-[38%] -rotate-[10deg]',
]

function NovelCoverCollage({ novels, className = '' }: NovelCoverCollageProps) {
  const picks = novels.slice(0, 3)
  if (picks.length === 0) return null

  return (
    <div className={`relative aspect-square ${className}`}>
      {picks.map((novel, i) => (
        <div key={novel.id} className={COLLAGE_SLOTS[i]}>
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-primary-800 shadow-2xl ring-1 ring-primary-700/60">
            {novel.cover_image_url ? (
              <img src={novel.cover_image_url} alt={novel.title} className="h-full w-full object-cover" />
            ) : (
              <NovelCoverPlaceholder id={novel.id} title={novel.title} author={novel.author} />
            )}
            {isPlaceholderNovel(novel.id) && <PreparingOverlay />}
          </div>
        </div>
      ))}
    </div>
  )
}

export default NovelCoverCollage
