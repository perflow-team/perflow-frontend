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

// GET /api/novels/{novelId}/characters/relations — the backend replays
// CHARACTER_RELATION_EVENTS (ADD/END/RETRACT) up to current_chapter_number
// and returns only the relations that are live as of that chapter.
export async function fetchCharacterRelations({
  novelId,
  currentChapterNumber,
}: FetchCharacterRelationsParams): Promise<CharacterRelations> {
  const { data } = await api.get<CharacterRelations>(`/api/novels/${novelId}/characters/relations`, {
    params: { current_chapter_number: currentChapterNumber },
  })
  return data
}
