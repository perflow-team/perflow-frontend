import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/entities/user/model/useAuthStore'
import { fetchMyFavorites, setNovelLike, type NovelDetail, type NovelSummary } from '../api/novelApi'

export function useToggleLike(id: number, realLikes = 0) {
  const userId = useAuthStore((s) => s.user?.id ?? null)
  const client = useQueryClient()
  const navigate = useNavigate()
  const favorites = useQuery({
    queryKey: ['my-favorites', userId], queryFn: fetchMyFavorites,
    enabled: userId !== null, staleTime: 60_000, retry: false,
  })
  const liked = favorites.data?.some((novel) => novel.id === id) ?? false
  const mutationKey = ['novel-like', userId, id]
  const saving = useIsMutating({ mutationKey }) > 0
  const mutation = useMutation({
    mutationKey,
    mutationFn: (desired: boolean) => setNovelLike(id, desired),
    onMutate: async () => {
      await Promise.all(['novel', 'novels', 'ranking', 'genre-novels', 'my-favorites']
        .map((key) => client.cancelQueries({ queryKey: [key] })))
    },
    onSuccess: async (result) => {
      const source = client.getQueryData<NovelDetail>(['novel', String(id), userId])
        ?? client.getQueriesData<NovelSummary[]>({ predicate: (query) =>
          ['novels', 'ranking', 'genre-novels', 'my-favorites'].includes(String(query.queryKey[0])) })
          .flatMap(([, items]) => items ?? []).find((novel) => novel.id === id)
      client.setQueryData<NovelSummary[]>(['my-favorites', userId], (items) => {
        const remaining = (items ?? []).filter((novel) => novel.id !== id)
        return result.liked && source ? [...remaining, { ...source, likes: result.likes }] : remaining
      })
      for (const key of ['novels', 'ranking', 'genre-novels', 'my-favorites']) {
        client.setQueriesData<NovelSummary[]>({ queryKey: [key] }, (items) =>
          items?.map((novel) => novel.id === id ? { ...novel, likes: result.likes } : novel))
      }
      client.setQueriesData<NovelDetail>({ queryKey: ['novel', String(id)] }, (novel) =>
        novel && { ...novel, likes: result.likes })
      client.setQueryData<NovelDetail>(['novel', String(id), userId], (novel) =>
        novel && { ...novel, is_favorite: result.is_favorite })
      await Promise.all([
        ...['novel', 'novels', 'ranking', 'genre-novels'].map((key) => client.invalidateQueries({ queryKey: [key] })),
        client.invalidateQueries({ queryKey: ['my-favorites', userId] }),
      ])
    },
  })
  const isPending = saving || mutation.isPending || (userId !== null && favorites.isPending)

  return {
    liked, count: realLikes, isPending,
    isError: mutation.isError || (userId !== null && favorites.isError),
    toggle: () => {
      if (userId === null) { navigate('/login'); return }
      if (isPending) return
      if (!favorites.data) { void favorites.refetch(); return }
      mutation.mutate(!liked)
    },
  }
}
