import { useState, useEffect, useRef } from 'react'

export const useCountUp = (target, duration = 800) => {
  const [value, setValue] = useState(target ?? 0)
  const prevTarget = useRef(target ?? 0)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (target == null) return

    // Show the correct value immediately on first render (no animation)
    if (isFirstRender.current) {
      isFirstRender.current = false
      setValue(target)
      prevTarget.current = target
      return
    }

    const start = prevTarget.current
    const diff = target - start
    if (diff === 0) return

    const startTime = performance.now()

    const step = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(start + diff * eased)
      if (progress < 1) requestAnimationFrame(step)
      else prevTarget.current = target
    }

    requestAnimationFrame(step)
  }, [target, duration])

  return value
}
