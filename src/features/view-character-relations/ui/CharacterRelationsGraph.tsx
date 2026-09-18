import { BriefcaseBusiness, ChevronDown, GraduationCap, HeartHandshake, House, Network, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useCharacterRelations } from '@/features/view-character-relations/model/useCharacterRelations'
import { groupRelations, RELATION_CATEGORIES, type RelationCategory } from '../lib/groupRelations'
import Skeleton from '@/shared/ui/Skeleton'

interface CharacterRelationsGraphProps { novelId: string; episodeId: string }
const ICONS = { family: House, work: BriefcaseBusiness, hierarchy: GraduationCap, social: HeartHandshake, other: Network }

function CharacterRelationsGraph({ novelId, episodeId }: CharacterRelationsGraphProps) {
  const { data, isLoading, isError } = useCharacterRelations({ novelId, episodeId })
  const [filter, setFilter] = useState<RelationCategory | 'all'>('all')
  const grouped = useMemo(() => groupRelations(data ?? { nodes: [], links: [] }), [data])
  const names = useMemo(() => new Map(data?.nodes.map(node => [node.id, node.name]) ?? []), [data])
  if (isLoading) return <div className="space-y-4 p-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-40 w-full" /></div>
  if (isError) return <p className="p-4 text-body-small text-neutral-500">관계도를 가져오지 못했어요.</p>
  if (!data?.nodes.length) return <p className="p-4 text-body-small text-neutral-500">아직 공개된 인물 관계가 없어요.</p>
  const groups = grouped.groups.filter(group => filter === 'all' || group.category === filter)

  return (
    <div className="h-full overflow-y-auto px-3 py-4">
      <div className="mb-4">
        <div className="flex items-center gap-2 text-primary-800"><Users size={17} /><h2 className="text-title-small font-semibold">관계별 인물 그룹</h2></div>
        <p className="mt-2 text-body-small leading-relaxed text-neutral-600">{episodeId}화까지 확인된 관계명으로 묶었어요. 같은 종류의 관계로 이어진 인물끼리 한 그룹이에요.</p>
        <p className="mt-1 text-label-small text-neutral-500">한 인물이 여러 그룹에 속할 수 있어요. 각 연결을 눌러 근거를 확인하세요.</p>
      </div>
      <div aria-label="관계 그룹 필터" className="mb-4 flex flex-wrap gap-1.5">
        {[{ id: 'all', title: '전체' }, ...RELATION_CATEGORIES.filter(category => grouped.groups.some(group => group.category === category.id))].map(category => (
          <button key={category.id} type="button" aria-pressed={filter === category.id} onClick={() => setFilter(category.id as RelationCategory | 'all')}
            className={`cursor-pointer rounded-full border px-2.5 py-1.5 text-label-small outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 ${filter === category.id ? 'border-primary-600 bg-primary-600 text-white' : 'border-neutral-200 text-neutral-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800'}`}>
            {category.title}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {groups.map(group => {
          const Icon = ICONS[group.category]
          return (
            <section key={group.id} data-relation-group={group.category} className="overflow-hidden rounded-xl border border-primary-200 bg-white">
              <div className="border-b border-primary-100 bg-primary-50 px-3 py-3">
                <div className="flex items-center gap-2 text-primary-800"><Icon size={16} /><h3 className="text-label-large font-semibold">{group.title}</h3><span className="ml-auto text-label-small">{group.nodes.length}명</span></div>
                <p className="mt-1.5 text-label-small leading-relaxed text-neutral-600">기준: {group.criterion}</p>
                <div className="mt-2 flex flex-wrap gap-1.5" aria-label="그룹 인물">
                  {group.nodes.map(node => <span key={node.id} className="rounded-md border border-primary-200 bg-white px-2 py-1 text-label-medium text-primary-900">{node.name}</span>)}
                </div>
              </div>
              <div className="divide-y divide-neutral-100">
                {group.links.map((link, i) => (
                  <details key={`${link.source}:${link.target}:${i}`} className="group px-3 open:bg-neutral-50">
                    <summary className="flex cursor-pointer list-none items-center gap-1 py-3 outline-none focus-visible:ring-2 focus-visible:ring-primary-400 [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0 flex-1 break-words text-left text-label-medium font-medium text-neutral-800">{names.get(link.source)}</span>
                      <span aria-hidden="true" className="h-px w-2 shrink-0 bg-primary-300" />
                      <span className="max-w-[42%] rounded-md border border-primary-200 bg-primary-50 px-1.5 py-1 text-center text-label-small text-primary-800">{link.relation_type}</span>
                      <span aria-hidden="true" className="h-px w-2 shrink-0 bg-primary-300" />
                      <span className="min-w-0 flex-1 break-words text-right text-label-medium font-medium text-neutral-800">{names.get(link.target)}</span>
                      <ChevronDown size={12} className="shrink-0 text-neutral-400 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="pb-3 text-body-small leading-relaxed text-neutral-600">{link.description || '이 관계에 대한 추가 설명은 아직 없어요.'}</p>
                  </details>
                ))}
              </div>
            </section>
          )
        })}
        {filter === 'all' && grouped.ungrouped.length > 0 && (
          <section className="rounded-xl border border-dashed border-neutral-300 p-3">
            <h3 className="text-label-large font-medium text-neutral-700">관계가 아직 확인되지 않은 인물</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">{grouped.ungrouped.map(node => <span key={node.id} className="rounded-md bg-neutral-100 px-2 py-1 text-label-medium text-neutral-600">{node.name}</span>)}</div>
          </section>
        )}
      </div>
    </div>
  )
}
export default CharacterRelationsGraph
