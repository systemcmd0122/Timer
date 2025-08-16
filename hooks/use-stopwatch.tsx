"use client"

import { useState, useRef, useCallback } from "react"

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const updateElapsed = useCallback(() => {
    if (startTimeRef.current !== null) {
      const now = performance.now()
      const newElapsed = now - startTimeRef.current
      setElapsed(newElapsed)
      animationFrameRef.current = requestAnimationFrame(updateElapsed)
    }
  }, [])

  const start = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = performance.now() - elapsed
      setIsRunning(true)
      animationFrameRef.current = requestAnimationFrame(updateElapsed)
    }
  }, [isRunning, elapsed, updateElapsed])

  const pause = useCallback(() => {
    if (isRunning && animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
      setIsRunning(false)
    }
  }, [isRunning])

  const reset = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    setElapsed(0)
    setIsRunning(false)
    startTimeRef.current = null
  }, [])

  const addMinute = useCallback(() => {
    const newElapsed = elapsed + 60 * 1000
    setElapsed(newElapsed)
    if (isRunning && startTimeRef.current !== null) {
      startTimeRef.current = performance.now() - newElapsed
    }
  }, [elapsed, isRunning])

  const subtractMinute = useCallback(() => {
    const newElapsed = Math.max(0, elapsed - 60 * 1000)
    setElapsed(newElapsed)
    if (isRunning && startTimeRef.current !== null) {
      startTimeRef.current = performance.now() - newElapsed
    }
  }, [elapsed, isRunning])

  const jumpTo = useCallback(
    (targetMs: number) => {
      setElapsed(targetMs)
      if (isRunning && startTimeRef.current !== null) {
        startTimeRef.current = performance.now() - targetMs
      }
    },
    [isRunning],
  )

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
