import { useState } from 'react'
import { mockLikesFor } from './mockLikes'

export function useToggleLike(id: number, realLikes?: number) {
  const base = realLikes ?? mockLikesFor(id)
  const [liked, setLiked] = useState(false)

  return {
    liked,
    count: liked ? base + 1 : base,
    toggle: () => setLiked((prev) => !prev),
  }
}
