import { useState } from 'react'
import Header from '@/widgets/header/ui/Header'
import MockNovelCard from '@/entities/novel/ui/MockNovelCard'
import { MOCK_NOVELS, type MockNovel } from '@/shared/mocks/mockCatalog'

const TABS = ['인기', '신작', '완결'] as const
type Tab = (typeof TABS)[number]

function sortForTab(tab: Tab): MockNovel[] {
  if (tab === '신작') return MOCK_NOVELS.filter((n) => n.isNew).sort((a, b) => b.views - a.views)
  if (tab === '완결') return MOCK_NOVELS.filter((n) => n.status === '완결').sort((a, b) => b.views - a.views)
  return [...MOCK_NOVELS].sort((a, b) => b.views - a.views)
}

function RankingPage() {
  const [tab, setTab] = useState<Tab>('인기')
  const ranked = sortForTab(tab)

  return (
    <div className="min-h-svh bg-white pt-16">
      <Header />

      <section className="mx-auto max-w-[1168px] px-4 py-10 md:px-10 md:py-16">
        <h1 className="text-headline-small text-neutral-900">랭킹</h1>

        <div className="mt-5 flex gap-1 border-b border-neutral-200">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-title-small transition-colors ${
                t === tab
                  ? 'border-b-2 border-primary-600 font-semibold text-primary-700'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-10 sm:justify-start">
          {ranked.map((novel, i) => (
            <MockNovelCard key={novel.id} novel={novel} rank={i + 1} rankDelta={novel.rankDelta} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default RankingPage
