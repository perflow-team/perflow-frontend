import { ENTITIES } from './mockData'

export interface EntityCardData {
  id: string
  name: string
  type: string
  facts: { label: string; text: string }[]
}

interface FetchEntityCardParams {
  novelId: string
  entityId: string
  progress: number
}

const NETWORK_DELAY_MS = 350

// Mocks a server endpoint: only facts unlocked by the reader's current
// progress are ever sent down — the client never receives spoiler text.
export function fetchEntityCard({ entityId, progress }: FetchEntityCardParams): Promise<EntityCardData | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const entity = ENTITIES[entityId]
      if (!entity || progress < entity.firstAppearsAt) {
        resolve(null)
        return
      }
      resolve({
        id: entity.id,
        name: entity.name,
        type: entity.type,
        facts: entity.facts.filter((f) => f.unlockAt <= progress).map((f) => ({ label: f.label, text: f.text })),
      })
    }, NETWORK_DELAY_MS)
  })
}
