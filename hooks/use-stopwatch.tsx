"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const baseTimeRef = useRef(0) // 基準時間（累積時間）
  const animationFrameRef = useRef<number | null>(null)

  // 高精度リアルタイム更新関数（requestAnimationFrameを使用）
  const updateElapsed = useCallback(() => {
    if (isRunning && startTimeRef.current !== null) {
      const now = performance.now()
      const currentElapsed = baseTimeRef.current + (now - startTimeRef.current)
      setElapsed(Math.max(0, currentElapsed))
      
      // 次のフレームで再度実行
      animationFrameRef.current = requestAnimationFrame(updateElapsed)
    }
  }, [isRunning])

  // isRunning状態に応じてアニメーションを管理
  useEffect(() => {
    // 既存のアニメーションフレームをキャンセル
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // 既存のインターバルをクリア
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (isRunning) {
      // 高精度アニメーションフレーム更新を開始
      animationFrameRef.current = requestAnimationFrame(updateElapsed)
      
      // フォールバック用の低頻度インターバル（ブラウザが非アクティブ時用）
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current !== null) {
          const now = performance.now()
          const currentElapsed = baseTimeRef.current + (now - startTimeRef.current)
          setElapsed(Math.max(0, currentElapsed))
        }
      }, 16) // 約60fps
    } else {
      // タイマー停止時は現在の基準時間を表示
      setElapsed(Math.max(0, baseTimeRef.current))
    }

    // クリーンアップ
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, updateElapsed])

  const start = useCallback(() => {
    if (!isRunning) {
      const now = performance.now()
      startTimeRef.current = now
      setIsRunning(true)
      console.log("Local timer started at:", now)
    }
  }, [isRunning])

  const pause = useCallback(() => {
    if (isRunning && startTimeRef.current !== null) {
      const now = performance.now()
      // 現在の経過時間を基準時間に追加
      const newBaseTime = baseTimeRef.current + (now - startTimeRef.current)
      baseTimeRef.current = Math.max(0, newBaseTime)
      setElapsed(baseTimeRef.current)
      startTimeRef.current = null
      setIsRunning(false)
      console.log("Local timer paused, elapsed:", baseTimeRef.current)
    }
  }, [isRunning])

  const reset = useCallback(() => {
    // アニメーションフレームをキャンセル
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
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
    console.log("Local timer reset")
  }, [])

  const addMinute = useCallback(() => {
    const minuteInMs = 60 * 1000
    
    if (isRunning && startTimeRef.current !== null) {
      // タイマーが動いている場合：開始時刻を1分前にずらす
      startTimeRef.current -= minuteInMs
      console.log("Added 1 minute while running")
    } else {
      // タイマーが停止している場合：基準時間に1分追加
      baseTimeRef.current = Math.max(0, baseTimeRef.current + minuteInMs)
      setElapsed(baseTimeRef.current)
      console.log("Added 1 minute while paused, new base time:", baseTimeRef.current)
    }
  }, [isRunning])

  const subtractMinute = useCallback(() => {
    const minuteInMs = 60 * 1000
    
    if (isRunning && startTimeRef.current !== null) {
      // タイマーが動いている場合：開始時刻を調整
      const now = performance.now()
      const currentElapsed = baseTimeRef.current + (now - startTimeRef.current)
      const newElapsed = Math.max(0, currentElapsed - minuteInMs)
      
      baseTimeRef.current = newElapsed
      startTimeRef.current = now
      console.log("Subtracted 1 minute while running")
    } else {
      // タイマーが停止している場合：基準時間から1分減算
      baseTimeRef.current = Math.max(0, baseTimeRef.current - minuteInMs)
      setElapsed(baseTimeRef.current)
      console.log("Subtracted 1 minute while paused, new base time:", baseTimeRef.current)
    }
  }, [isRunning])

  const jumpTo = useCallback((targetMs: number) => {
    const clampedTarget = Math.max(0, targetMs)
    
    if (isRunning && startTimeRef.current !== null) {
      // タイマーが動いている場合
      const now = performance.now()
      baseTimeRef.current = clampedTarget
      startTimeRef.current = now
      console.log("Jumped to while running:", clampedTarget)
    } else {
      // タイマーが停止している場合
      baseTimeRef.current = clampedTarget
      setElapsed(clampedTarget)
      console.log("Jumped to while paused:", clampedTarget)
    }
  }, [isRunning])

  // メモ化されたreturnオブジェクト
  const timerInterface = useMemo(() => ({
    elapsed,
    isRunning,
    start,
    pause,
    reset,
    addMinute,
    subtractMinute,
    jumpTo,
  }), [elapsed, isRunning, start, pause, reset, addMinute, subtractMinute, jumpTo])

  return timerInterface
}