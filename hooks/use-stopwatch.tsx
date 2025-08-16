"use client"

import { useState, useRef, useCallback, useEffect } from "react"

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const accumulatedTimeRef = useRef(0)

  const updateElapsed = useCallback(() => {
    if (startTimeRef.current !== null) {
      const now = Date.now()
      const currentElapsed = accumulatedTimeRef.current + (now - startTimeRef.current)
      setElapsed(currentElapsed)
    }
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(updateElapsed, 10) // 10ms間隔で更新
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, updateElapsed])

  const start = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = Date.now()
      setIsRunning(true)
    }
  }, [isRunning])

  const pause = useCallback(() => {
    if (isRunning && startTimeRef.current !== null) {
      const now = Date.now()
      accumulatedTimeRef.current += now - startTimeRef.current
      setElapsed(accumulatedTimeRef.current)
      startTimeRef.current = null
      setIsRunning(false)
    }
  }, [isRunning])

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setElapsed(0)
    setIsRunning(false)
    startTimeRef.current = null
    accumulatedTimeRef.current = 0
  }, [])

  const addMinute = useCallback(() => {
    const minuteInMs = 60 * 1000
    accumulatedTimeRef.current += minuteInMs
    
    if (isRunning && startTimeRef.current !== null) {
      // タイマーが動いている場合は、開始時刻を調整して継続的な更新を維持
      startTimeRef.current -= minuteInMs
    } else {
      // タイマーが停止している場合は、直接elapsed を更新
      setElapsed(accumulatedTimeRef.current)
    }
  }, [isRunning])

  const subtractMinute = useCallback(() => {
    const minuteInMs = 60 * 1000
    const newAccumulated = Math.max(0, accumulatedTimeRef.current - minuteInMs)
    const adjustment = accumulatedTimeRef.current - newAccumulated
    accumulatedTimeRef.current = newAccumulated
    
    if (isRunning && startTimeRef.current !== null) {
      // タイマーが動いている場合は、開始時刻を調整
      startTimeRef.current += adjustment
    } else {
      // タイマーが停止している場合は、直接elapsed を更新
      setElapsed(accumulatedTimeRef.current)
    }
  }, [isRunning])

  const jumpTo = useCallback((targetMs: number) => {
    const clampedTarget = Math.max(0, targetMs)
    accumulatedTimeRef.current = clampedTarget
    
    if (isRunning && startTimeRef.current !== null) {
      // タイマーが動いている場合は、開始時刻を現在時刻 - target に設定
      startTimeRef.current = Date.now() - clampedTarget
    } else {
      // タイマーが停止している場合は、直接elapsed を更新
      setElapsed(clampedTarget)
    }
  }, [isRunning])

  return {
    elapsed,
    isRunning,
    start,
    pause,
    reset,
    addMinute,
    subtractMinute,
    jumpTo,
  }
}