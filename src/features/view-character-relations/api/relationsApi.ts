import { api } from '@/shared/api/base'

export interface RelationNode {
  id: number
  name: string
}

export interface RelationLink {
  source: number
  target: number
  relation_type: string
  description: string
}

export interface CharacterRelations {
  nodes: RelationNode[]
  links: RelationLink[]
}

interface FetchCharacterRelationsParams {
  novelId: string
  currentChapterNumber: number
}

export async function fetchCharacterRelations({
  novelId,
  currentChapterNumber,
}: FetchCharacterRelationsParams): Promise<CharacterRelations> {
  const { data } = await api.get<CharacterRelations>(`/api/novels/${novelId}/characters/relations`, {
    params: { current_chapter_number: currentChapterNumber },
  })
  return data
}
