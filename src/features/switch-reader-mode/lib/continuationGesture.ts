export function createContinuationGesture(now: number) {
  let endSince: number | null = null
  let lastWheel = now
  let distance = 0
  let armed = false
  let locked = false
  let touchArmed = false
  const ready = (time: number) => !locked && endSince !== null && time - endSince >= 400
  const commit = () => { locked = true; return true }

  return {
    updateEnd(atEnd: boolean, time: number) {
      if (!atEnd) { endSince = null; armed = false; touchArmed = false; distance = 0 }
      else if (endSince === null) endSince = time
    },
    wheel(delta: number, time: number) {
      const freshGesture = time - lastWheel >= 240
      lastWheel = time
      if (delta <= 0 || !ready(time)) { armed = false; distance = 0; return false }
      if (freshGesture) { armed = true; distance = 0 }
      if (!armed) return false
      distance += delta
      return distance >= 80 ? commit() : false
    },
    touchStart(time: number) { touchArmed = ready(time) },
    touchEnd(upwardDistance: number, horizontalDistance: number) {
      const advance = touchArmed && !locked && upwardDistance >= 60 && upwardDistance > Math.abs(horizontalDistance)
      touchArmed = false
      return advance ? commit() : false
    },
    cancelTouch() { touchArmed = false },
    key(time: number, repeat: boolean) { return !repeat && ready(time) ? commit() : false },
    retry(time: number) { locked = false; armed = false; distance = 0; lastWheel = time; endSince = null },
  }
}
