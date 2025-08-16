"use client"

import { useState, useRef, useCallback, useEffect } from "react"

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const baseTimeRef = useRef(0) // 基準時間（累積時間）

  // リアルタイム更新関数
  const updateElapsed = useCallback(() => {
    if (isRunning && startTimeRef.current !== null) {
      const now = Date.now()
      const currentElapsed = baseTimeRef.current + (now - startTimeRef.current)
      setElapsed(Math.max(0, currentElapsed))
    }
  }, [isRunning])

  // isRunning状態に応じてインターバルを管理
  useEffect(() => {
    // 既存のインターバルをクリア
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (isRunning) {
      // タイマー開始時にリアルタイム更新を開始
      intervalRef.current = setInterval(updateElapsed, 50) // 50ms間隔でスムーズ更新
      updateElapsed() // 即座に一度実行
    } else {
      // タイマー停止時は現在の基準時間を表示
      setElapsed(Math.max(0, baseTimeRef.current))
    }

    // クリーンアップ
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
      console.log("Local timer started") // デバッグログ
    }
  }, [isRunning])

  const pause = useCallback(() => {
    if (isRunning && startTimeRef.current !== null) {
      const now = Date.now()
      // 現在の経過時間を基準時間に追加
      baseTimeRef.current += now - startTimeRef.current
      setElapsed(Math.max(0, baseTimeRef.current))
      startTimeRef.current = null
      setIsRunning(false)
      console.log("Local timer paused, elapsed:", baseTimeRef.current) // デバッグログ
    }
  }, [isRunning])

  const reset = useCallback(() => {
    // インターバルクリア
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    // 全ての値をリセット
    setElapsed(0)
    setIsRunning(false)
    startTimeRef.current = null
    baseTimeRef.current = 0
    console.log("Local timer reset") // デバッグログ
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
    console.log("Added 1 minute, new base time:", baseTimeRef.current) // デバッグログ
  }, [isRunning])

  const subtractMinute = useCallback(() => {
    const minuteInMs = 60 * 1000
    
    if (isRunning && startTimeRef.current !== null) {
      // タイマーが動いている場合：開始時刻を調整
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
    console.log("Subtracted 1 minute, new base time:", baseTimeRef.current) // デバッグログ
  }, [isRunning])

  const jumpTo = useCallback((targetMs: number) => {
    const clampedTarget = Math.max(0, targetMs)
    
    if (isRunning && startTimeRef.current !== null) {
      // タイマーが動いている場合
      const now = Date.now()
      baseTimeRef.current = clampedTarget
      startTimeRef.current = now
    } else {
      // タイマーが停止している場合
      baseTimeRef.current = clampedTarget
      setElapsed(clampedTarget)
    }
    console.log("Jumped to:", clampedTarget, "new base time:", baseTimeRef.current) // デバッグログ
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