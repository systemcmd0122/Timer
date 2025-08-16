"use client"

import { useState, useRef, useCallback, useEffect } from "react"

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const baseTimeRef = useRef(0) // 基準時間（一時停止時に累積される時間）

  // リアルタイム更新関数
  const updateElapsed = useCallback(() => {
    if (isRunning && startTimeRef.current !== null) {
      const now = Date.now()
      const currentElapsed = baseTimeRef.current + (now - startTimeRef.current)
      setElapsed(Math.max(0, currentElapsed))
    }
  }, [isRunning])

  // isRunning の状態に応じてインターバルを設定/クリア
  useEffect(() => {
    if (isRunning) {
      // タイマー開始時にインターバルを設定
      intervalRef.current = setInterval(updateElapsed, 50) // 50ms間隔で更新（スムーズな表示）
      
      // 即座に一度更新
      updateElapsed()
    } else {
      // タイマー停止時にインターバルをクリア
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    // クリーンアップ関数
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, updateElapsed])

  const start = useCallback(() => {
    if (!isRunning) {
      const now = Date.now()
      startTimeRef.current = now
      setIsRunning(true)
    }
  }, [isRunning])

  const pause = useCallback(() => {
    if (isRunning) {
      if (startTimeRef.current !== null) {
        const now = Date.now()
        // 現在の経過時間を基準時間に追加
        baseTimeRef.current += now - startTimeRef.current
        setElapsed(Math.max(0, baseTimeRef.current))
      }
      startTimeRef.current = null
      setIsRunning(false)
    }
  }, [isRunning])

  const reset = useCallback(() => {
    // インターバルをクリア
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    // 全ての値をリセット
    setElapsed(0)
    setIsRunning(false)
    startTimeRef.current = null
    baseTimeRef.current = 0
  }, [])

  const addMinute = useCallback(() => {
    const minuteInMs = 60 * 1000
    
    if (isRunning && startTimeRef.current !== null) {
      // タイマーが動いている場合：開始時刻を1分前にずらす
      startTimeRef.current -= minuteInMs
    } else {
      // タイマーが停止している場合：基準時間に1分追加
      baseTimeRef.current += minuteInMs
      setElapsed(Math.max(0, baseTimeRef.current))
    }
  }, [isRunning])

  const subtractMinute = useCallback(() => {
    const minuteInMs = 60 * 1000
    
    if (isRunning && startTimeRef.current !== null) {
      // タイマーが動いている場合：開始時刻を1分後にずらす（ただし現在時刻を超えない）
      const now = Date.now()
      const currentElapsed = baseTimeRef.current + (now - startTimeRef.current)
      const newElapsed = Math.max(0, currentElapsed - minuteInMs)
      
      baseTimeRef.current = newElapsed
      startTimeRef.current = now
    } else {
      // タイマーが停止している場合：基準時間から1分減算
      baseTimeRef.current = Math.max(0, baseTimeRef.current - minuteInMs)
      setElapsed(baseTimeRef.current)
    }
  }, [isRunning])

  const jumpTo = useCallback((targetMs: number) => {
    const clampedTarget = Math.max(0, targetMs)
    
    if (isRunning && startTimeRef.current !== null) {
      // タイマーが動いている場合：新しい基準時間を設定し、開始時刻を現在時刻に設定
      const now = Date.now()
      baseTimeRef.current = clampedTarget
      startTimeRef.current = now
    } else {
      // タイマーが停止している場合：基準時間を直接設定
      baseTimeRef.current = clampedTarget
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