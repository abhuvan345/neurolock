"use client"

import { useCallback, useRef, useState } from "react"

export interface BehaviorFeatures {
  avg_key_interval: number
  avg_key_hold: number
  mouse_speed: number
  click_rate: number
  click_variance: number
  scroll_rate: number
  nav_entropy: number
  time_on_page: number
}

interface KeyEvent {
  downTime: number
  upTime?: number
}

export function useBehaviorTracking() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [features, setFeatures] = useState<BehaviorFeatures>({
    avg_key_interval: 0,
    avg_key_hold: 0,
    mouse_speed: 0,
    click_rate: 0,
    click_variance: 0,
    scroll_rate: 0,
    nav_entropy: 0,
    time_on_page: 0,
  })

  const metricsRef = useRef({
    keyIntervals: [] as number[],
    keyHolds: [] as number[],
    lastKeyTime: 0,
    keyEvents: new Map<string, KeyEvent>(),
    mouseMoves: [] as { x: number; y: number; time: number }[],
    lastMousePos: { x: 0, y: 0 },
    clicks: 0,
    clickTimes: [] as number[],
    scrolls: 0,
    lastMouseTime: 0,
    startTime: Date.now(),
    aggregationWindow: 5000, // 5 seconds
  })

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
    metricsRef.current.startTime = Date.now()
    metricsRef.current.keyIntervals = []
    metricsRef.current.keyHolds = []
    metricsRef.current.mouseMoves = []
    metricsRef.current.clicks = 0
    metricsRef.current.scrolls = 0

    // Keyboard tracking
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now()
      const key = e.key

      if (metricsRef.current.lastKeyTime > 0) {
        const interval = now - metricsRef.current.lastKeyTime
        metricsRef.current.keyIntervals.push(interval)
      }

      metricsRef.current.lastKeyTime = now
      metricsRef.current.keyEvents.set(key, { downTime: now })
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const now = Date.now()
      const key = e.key
      const keyEvent = metricsRef.current.keyEvents.get(key)

      if (keyEvent) {
        const hold = now - keyEvent.downTime
        metricsRef.current.keyHolds.push(hold)
        metricsRef.current.keyEvents.delete(key)
      }
    }

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      const pos = { x: e.clientX, y: e.clientY }

      metricsRef.current.mouseMoves.push({ ...pos, time: now })
      metricsRef.current.lastMousePos = pos
      metricsRef.current.lastMouseTime = now
    }

    const handleClick = () => {
      const now = Date.now()
      metricsRef.current.clicks++
      metricsRef.current.clickTimes.push(now)
    }

    const handleScroll = () => {
      metricsRef.current.scrolls++
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("click", handleClick)
    window.addEventListener("scroll", handleScroll)

    // Aggregation interval
    const aggregationInterval = setInterval(() => {
      aggregateFeatures()
    }, metricsRef.current.aggregationWindow)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("click", handleClick)
      window.removeEventListener("scroll", handleScroll)
      clearInterval(aggregationInterval)
    }
  }, [])

  const aggregateFeatures = useCallback(() => {
    const metrics = metricsRef.current
    const now = Date.now()
    const elapsed = (now - metrics.startTime) / 1000 // in seconds

    // Calculate averages
    const avg_key_interval =
      metrics.keyIntervals.length > 0
        ? metrics.keyIntervals.reduce((a, b) => a + b, 0) / metrics.keyIntervals.length
        : 0

    const avg_key_hold =
      metrics.keyHolds.length > 0 ? metrics.keyHolds.reduce((a, b) => a + b, 0) / metrics.keyHolds.length : 0

    // Calculate mouse speed
    let mouse_speed = 0
    if (metrics.mouseMoves.length > 1) {
      const totalDistance = 0
      for (let i = 1; i < metrics.mouseMoves.length; i++) {
        const prev = metrics.mouseMoves[i - 1]
        const curr = metrics.mouseMoves[i]
        const dx = curr.x - prev.x
        const dy = curr.y - prev.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const timeDiff = (curr.time - prev.time) / 1000 // seconds
        if (timeDiff > 0) {
          mouse_speed += distance / timeDiff
        }
      }
      mouse_speed = mouse_speed / (metrics.mouseMoves.length - 1)
    }

    const click_rate = metrics.clicks / Math.max(elapsed, 1)
    const scroll_rate = metrics.scrolls / Math.max(elapsed, 1)

    // Calculate click inter-interval variance (ms^2)
    let click_variance = 0
    if (metrics.clickTimes.length > 1) {
      const intervals: number[] = []
      for (let i = 1; i < metrics.clickTimes.length; i++) {
        intervals.push(metrics.clickTimes[i] - metrics.clickTimes[i - 1])
      }
      const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length
      const variance = intervals.reduce((a, b) => a + (b - mean) * (b - mean), 0) / intervals.length
      click_variance = Math.round(variance * 10) / 10
    }

    // Calculate navigation entropy based on mouse move occupancy in a simple grid
    let nav_entropy = 0
    if (metrics.mouseMoves.length > 0) {
      // Use a 6x6 grid over viewport
      const cols = 6
      const rows = 6
      const counts = new Map<string, number>()
      for (const m of metrics.mouseMoves) {
        // Normalize to viewport via lastMousePos as approx — client coords are already viewport-based
        const col = Math.floor((m.x / Math.max(window.innerWidth, 1)) * cols)
        const row = Math.floor((m.y / Math.max(window.innerHeight, 1)) * rows)
        const key = `${Math.max(0, Math.min(cols - 1, col))}:${Math.max(0, Math.min(rows - 1, row))}`
        counts.set(key, (counts.get(key) || 0) + 1)
      }
      const total = metrics.mouseMoves.length
      let entropy = 0
      counts.forEach((c) => {
        const p = c / total
        entropy -= p * Math.log2(p)
      })
      nav_entropy = Math.round(entropy * 1000) / 1000
    }

    const newFeatures: BehaviorFeatures = {
      avg_key_interval: Math.round(avg_key_interval * 10) / 10,
      avg_key_hold: Math.round(avg_key_hold * 10) / 10,
      mouse_speed: Math.round(mouse_speed * 10) / 10,
      click_rate: Math.round(click_rate * 100) / 100,
      click_variance,
      scroll_rate: Math.round(scroll_rate * 100) / 100,
      nav_entropy,
      time_on_page: Math.round(elapsed),
    }

    setFeatures(newFeatures)

    // Reset counters for next window
    metrics.keyIntervals = []
    metrics.keyHolds = []
    metrics.mouseMoves = []
    metrics.clicks = 0
    metrics.clickTimes = []
    metrics.scrolls = 0
    metrics.startTime = now
  }, [])

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
  }, [])

  return {
    features,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  }
}
