import { useQuery } from '@tanstack/react-query'
import { fetchCharacterRelations } from '@/features/view-character-relations/api/relationsApi'

interface UseCharacterRelationsParams {
  novelId: string
  episodeId: string
}

export function useCharacterRelations({ novelId, episodeId }: UseCharacterRelationsParams) {
  return useQuery({
    queryKey: ['character-relations', novelId, episodeId],
    queryFn: () => fetchCharacterRelations({ novelId, currentChapterNumber: Number(episodeId) }),
    retry: false,
  })
}
