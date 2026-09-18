import type { CharacterRelations, RelationLink, RelationNode } from '../api/relationsApi'

export const RELATION_CATEGORIES = [
  { id: 'family', title: '가족', criterion: '부모·자녀·형제·배우자 등 가족 관계로 연결된 인물', pattern: /가족|부모|자녀|부녀|부자|모녀|모자|부부|배우자|아내|남편|아버지|어머니|아들|딸|형제|자매|남매|누나|누이|오빠|언니|동생|친척|사촌|삼촌|조카|장인|장모|시부|시모|며느리|사위|할머니|할아버지|손자|손녀|family|parent|child|father|mother|sibling|brother|sister|spouse|husband|wife|cousin/i },
  { id: 'work', title: '직장·소속', criterion: '동료·직원·같은 직장이나 조직의 소속 관계로 연결된 인물', pattern: /동료|직장|회사|조직|고용|직원|사원|사장|상사|부하|상하|직속|동업|직장|소속|부대|동문|colleague|coworker|co.worker|employ|workplace|boss|subordinate|superior|organization/i },
  { id: 'hierarchy', title: '상하·사제', criterion: '상사·부하·주종·스승·제자 등 위계 관계로 연결된 인물', pattern: /상사|부하|상하|직속|고용주|주종|주인|하인|종복|스승|제자|사제|사부|군신|상관|boss|subordinate|superior|master|servant|mentor|apprentice|teacher|student/i },
  { id: 'social', title: '친교·갈등', criterion: '친구·연인·협력·적대·경쟁 관계로 연결된 인물', pattern: /친구|우정|연인|애인|사랑|짝사랑|협력|동맹|적대|원수|경쟁|갈등|친밀|friend|lover|romance|ally|alliance|enemy|rival|conflict/i },
  { id: 'other', title: '기타 관계', criterion: '위 기준에 해당하지 않는 관계명을 가진 인물', pattern: null },
] as const
export type RelationCategory = (typeof RELATION_CATEGORIES)[number]['id']
export interface RelationGroup {
  id: string
  category: RelationCategory
  title: string
  criterion: string
  nodes: RelationNode[]
  links: RelationLink[]
}

export function groupRelations(data: CharacterRelations): { groups: RelationGroup[]; ungrouped: RelationNode[] } {
  const nodeMap = new Map(data.nodes.map(node => [node.id, node]))
  const validLinks = data.links.filter(link => nodeMap.has(link.source) && nodeMap.has(link.target))
  const categoriesFor = (link: RelationLink) => {
    const matches = RELATION_CATEGORIES.filter(category => category.pattern?.test(link.relation_type))
    return matches.length ? matches.map(category => category.id) : ['other']
  }
  const groups: RelationGroup[] = []
  for (const category of RELATION_CATEGORIES) {
    const links = validLinks.filter(link => categoriesFor(link).includes(category.id))
    const neighbors = new Map<number, Set<number>>()
    for (const link of links) {
      if (!neighbors.has(link.source)) neighbors.set(link.source, new Set())
      if (!neighbors.has(link.target)) neighbors.set(link.target, new Set())
      neighbors.get(link.source)!.add(link.target)
      neighbors.get(link.target)!.add(link.source)
    }
    const visited = new Set<number>()
    for (const root of neighbors.keys()) {
      if (visited.has(root)) continue
      const ids = new Set<number>()
      const queue = [root]
      while (queue.length) {
        const id = queue.pop()!
        if (visited.has(id)) continue
        visited.add(id)
        ids.add(id)
        queue.push(...neighbors.get(id)!)
      }
      const nodes = [...ids].sort((a, b) => a - b).map(id => nodeMap.get(id)!)
      groups.push({ id: `${category.id}:${nodes.map(node => node.id).join('-')}`, category: category.id,
        title: category.title, criterion: category.criterion, nodes,
        links: links.filter(link => ids.has(link.source) && ids.has(link.target)) })
    }
  }
  const linked = new Set(validLinks.flatMap(link => [link.source, link.target]))
  return { groups, ungrouped: data.nodes.filter(node => !linked.has(node.id)) }
}
