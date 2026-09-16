import { useRef } from 'react'

const HOVER_DELAY_MS = 300
const LONG_PRESS_DELAY_MS = 500

// Spec 2.3: 롱프레스(모바일) / 우클릭 또는 hover 300ms(PC) → 캐릭터 카드 오버레이 호출
export function useEntityTrigger(onTrigger: (word: string, contextSentence: string) => void) {
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearHoverTimer = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current)
      hoverTimer.current = null
    }
  }

  const clearPressTimer = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  const getHandlers = (word: string, contextSentence: string) => ({
    onMouseEnter: () => {
      clearHoverTimer()
      hoverTimer.current = setTimeout(() => onTrigger(word, contextSentence), HOVER_DELAY_MS)
    },
    onMouseLeave: clearHoverTimer,
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault()
      onTrigger(word, contextSentence)
    },
    onTouchStart: () => {
      clearPressTimer()
      pressTimer.current = setTimeout(() => onTrigger(word, contextSentence), LONG_PRESS_DELAY_MS)
    },
    onTouchEnd: clearPressTimer,
    onTouchMove: clearPressTimer,
  })

  return { getHandlers }
}
