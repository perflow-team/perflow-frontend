import type { KeyboardEvent } from 'react'

// CSS hover highlights the word. Only an explicit click or keyboard
// activation opens a card; there are no pointer/touch timers or listeners.
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
