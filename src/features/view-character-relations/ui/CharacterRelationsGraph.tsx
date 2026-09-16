import { useMemo, useState } from 'react'
import type { RelationLink } from '@/features/view-character-relations/api/relationsApi'
import { useCharacterRelations } from '@/features/view-character-relations/model/useCharacterRelations'
import Skeleton from '@/shared/ui/Skeleton'

interface CharacterRelationsGraphProps {
  novelId: string
  episodeId: string
}

const SIZE = 280
const CENTER = SIZE / 2
const RADIUS = SIZE / 2 - 40

// Spec 3 (신규): 이벤트 소싱으로 재생된, 현재 진도까지 스포일러 없는 인물
// 관계도. 별도 그래프 라이브러리 없이 노드를 원형으로 배치하는 가벼운
// SVG 레이아웃으로 구현 — 인물 수가 적은 MVP 단계엔 충분하고, force-layout
// 라이브러리(d3-force 등)로 교체해도 nodes/links 데이터 구조는 그대로 재사용 가능.
function CharacterRelationsGraph({ novelId, episodeId }: CharacterRelationsGraphProps) {
  const { data, isLoading, isError } = useCharacterRelations({ novelId, episodeId })
  const [selectedLink, setSelectedLink] = useState<RelationLink | null>(null)

  const positions = useMemo(() => {
    if (!data) return new Map<number, { x: number; y: number }>()
    const map = new Map<number, { x: number; y: number }>()
    data.nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / data.nodes.length - Math.PI / 2
      map.set(node.id, { x: CENTER + RADIUS * Math.cos(angle), y: CENTER + RADIUS * Math.sin(angle) })
    })
    return map
  }, [data])

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
        <Skeleton className="h-56 w-56 rounded-full" />
        <Skeleton className="h-3 w-40" />
      </div>
    )
  }

  if (isError) {
    return <p className="p-4 text-body-small text-neutral-400">관계도를 가져오지 못했어요.</p>
  }

  if (!data || data.nodes.length === 0) {
    return <p className="p-4 text-body-small text-neutral-400">아직 공개된 인물 관계가 없어요.</p>
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto w-full max-w-72">
        {data.links.map((link, i) => {
          const from = positions.get(link.source)
          const to = positions.get(link.target)
          if (!from || !to) return null
          const isSelected = selectedLink === link
          return (
            <g
              key={i}
              onClick={() => setSelectedLink(isSelected ? null : link)}
              className="cursor-pointer"
            >
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                strokeWidth={isSelected ? 2.5 : 1.5}
                className={isSelected ? 'stroke-primary-600' : 'stroke-neutral-300'}
              />
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2}
                textAnchor="middle"
                className={`text-[9px] ${isSelected ? 'fill-primary-700 font-medium' : 'fill-neutral-400'}`}
              >
                {link.relation_type}
              </text>
            </g>
          )
        })}

        {data.nodes.map((node) => {
          const pos = positions.get(node.id)
          if (!pos) return null
          return (
            <g key={node.id}>
              <circle cx={pos.x} cy={pos.y} r={16} className="fill-primary-100 stroke-primary-400" strokeWidth={1.5} />
              <text
                x={pos.x}
                y={pos.y + 28}
                textAnchor="middle"
                className="fill-neutral-700 text-[11px] font-medium"
              >
                {node.name}
              </text>
            </g>
          )
        })}
      </svg>

      {selectedLink ? (
        <div className="mt-4 rounded-lg border border-neutral-200 p-3">
          <p className="text-label-medium font-medium text-neutral-900">{selectedLink.relation_type}</p>
          <p className="mt-1 text-body-small text-neutral-600">{selectedLink.description}</p>
        </div>
      ) : (
        <p className="mt-4 text-center text-label-small text-neutral-400">선을 눌러 관계 설명을 볼 수 있어요</p>
      )}
    </div>
  )
}

export default CharacterRelationsGraph
