import { DICTIONARY_TERMS } from './mockData'

export interface DictionaryEntry {
  id: string
  term: string
  locked: boolean
  definition: string | null
}

interface FetchDictionaryParams {
  novelId: string
  progress: number
  query?: string
}

const NETWORK_DELAY_MS = 200

// Mocks a server endpoint. Two distinct behaviors on purpose:
// - Browsing (no query): every term is listed, but locked ones have their
//   definition stripped so the UI can only show a lock icon, never the text.
// - Searching (query set): locked terms are dropped entirely. Surfacing a
//   locked term's existence in search results would itself be a spoiler.
export function fetchDictionaryTerms({ progress, query }: FetchDictionaryParams): Promise<DictionaryEntry[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const trimmedQuery = query?.trim()

      const entries = DICTIONARY_TERMS.filter((term) => {
        if (!trimmedQuery) return true
        const locked = term.firstAppearsAt > progress
        if (locked) return false
        return term.term.includes(trimmedQuery)
      }).map((term) => {
        const locked = term.firstAppearsAt > progress
        return {
          id: term.id,
          term: term.term,
          locked,
          definition: locked ? null : term.definition,
        }
      })

      resolve(entries)
    }, NETWORK_DELAY_MS)
  })
}
