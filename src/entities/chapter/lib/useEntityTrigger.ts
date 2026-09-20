import type { KeyboardEvent } from 'react'

export function useEntityTrigger(onTrigger: (word: string, contextSentence: string, lookupOffset: number, selectionCharOffset?: number) => void) {
  const getHandlers = (word: string, contextSentence: string, lookupOffset = 0, selectionCharOffset?: number) => ({
    onClick: () => {
      onTrigger(word, contextSentence, lookupOffset, selectionCharOffset)
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (!event.repeat) onTrigger(word, contextSentence, lookupOffset, selectionCharOffset)
      }
    },
  })

  return { getHandlers }
}
