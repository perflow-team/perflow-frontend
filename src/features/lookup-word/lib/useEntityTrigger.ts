import { useEffect, useRef } from 'react'
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react'

const LONG_PRESS_DELAY_MS = 500
const MOVE_TOLERANCE_PX = 10

// Hover is visual only. Click/keyboard opens a card; touch and pen also
// support a long press, with scroll/cancel/unmount cancelling the timer.
export function useEntityTrigger(onTrigger: (word: string, contextSentence: string, lookupOffset: number) => void, contentKey: unknown) {
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const press = useRef<{ id: number; x: number; y: number } | null>(null)
  const suppressClickUntil = useRef(0)
  const cancel = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current)
    pressTimer.current = null
    press.current = null
  }
  useEffect(() => {
    cancel()
    const newPress = () => { suppressClickUntil.current = 0 }
    const suppressSyntheticClick = (event: globalThis.MouseEvent) => {
      if (event.detail > 0 && Date.now() < suppressClickUntil.current) {
        event.preventDefault()
        event.stopImmediatePropagation()
        suppressClickUntil.current = 0
      }
    }
    // A long press inserts the modal before touchend. The synthesized click
    // can then hit its backdrop and immediately close it. Consume that click;
    // a new, deliberate pointerdown always enables normal clicking again.
    document.addEventListener('pointerdown', newPress, true)
    document.addEventListener('click', suppressSyntheticClick, true)
    document.addEventListener('scroll', cancel, true)
    window.addEventListener('blur', cancel)
    return () => {
      cancel()
      document.removeEventListener('pointerdown', newPress, true)
      document.removeEventListener('click', suppressSyntheticClick, true)
      document.removeEventListener('scroll', cancel, true)
      window.removeEventListener('blur', cancel)
    }
  }, [contentKey])

  const getHandlers = (word: string, contextSentence: string, lookupOffset = 0) => ({
    onClick: () => {
      if (Date.now() >= suppressClickUntil.current) onTrigger(word, contextSentence, lookupOffset)
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onTrigger(word, contextSentence, lookupOffset) }
    },
    onPointerDown: (event: PointerEvent) => {
      if (event.pointerType === 'mouse' || !event.isPrimary) return
      cancel()
      press.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
      pressTimer.current = setTimeout(() => {
        cancel()
        suppressClickUntil.current = Date.now() + 1000
        onTrigger(word, contextSentence, lookupOffset)
      }, LONG_PRESS_DELAY_MS)
    },
    onPointerMove: (event: PointerEvent) => {
      const start = press.current
      if (start?.id === event.pointerId && Math.hypot(event.clientX - start.x, event.clientY - start.y) > MOVE_TOLERANCE_PX) {
        suppressClickUntil.current = Date.now() + 1000
        cancel()
      }
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onPointerLeave: cancel,
    onContextMenu: (event: MouseEvent) => event.preventDefault(),
  })

  return { getHandlers }
}
