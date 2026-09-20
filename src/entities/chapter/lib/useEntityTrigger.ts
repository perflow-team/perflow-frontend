import type { KeyboardEvent } from 'react'

// Click and keyboard open the full card; ReaderContentBlocks owns the hover preview.
export function useEntityTrigger(onTrigger: (word: string, contextSentence: string, lookupOffset: number) => void) {
  const getHandlers = (word: string, contextSentence: string, lookupOffset = 0) => ({
    onClick: () => {
      onTrigger(word, contextSentence, lookupOffset)
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (!event.repeat) onTrigger(word, contextSentence, lookupOffset)
      }
    },
  })

  return { getHandlers }
}
