interface NovelCoverCollageProps {
  novels: { id: number; title: string; cover_image_url: string | null }[]
  className?: string
}

// Staggered real-cover stack used anywhere the brand needs a visual asset
// (home hero, login panel) instead of a generic gradient blob. Degrades to
// nothing when no novel in the list has cover art yet.
const COLLAGE_SLOTS = [
  'absolute left-[18%] top-[4%] z-30 w-[58%] -rotate-3',
  'absolute bottom-[2%] left-0 z-20 w-[42%] rotate-6',
  'absolute right-0 top-0 z-10 w-[38%] -rotate-[10deg]',
]

function NovelCoverCollage({ novels, className = '' }: NovelCoverCollageProps) {
  const covers = novels.filter((n) => n.cover_image_url).slice(0, 3)
  if (covers.length === 0) return null

  return (
    <div className={`relative aspect-square ${className}`}>
      {covers.map((novel, i) => (
        <div key={novel.id} className={COLLAGE_SLOTS[i]}>
          <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-primary-800 shadow-2xl ring-1 ring-primary-700/60">
            <img src={novel.cover_image_url!} alt={novel.title} className="h-full w-full object-cover" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default NovelCoverCollage
