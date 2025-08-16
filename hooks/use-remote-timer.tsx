"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue, set } from "firebase/database"

interface TimerState {
  elapsed: number
  isRunning: boolean
  lastUpdate: number
  sessionId: string
  baseTime: number // 基準時間を追加
}

export function useRemoteTimer() {
  const [timerState, setTimerState] = useState<TimerState>({
    elapsed: 0,
    isRunning: false,
    lastUpdate: Date.now(),
    sessionId: "",
    baseTime: 0,
  })
  const [displayElapsed, setDisplayElapsed] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // リアルタイム表示更新関数
  const updateDisplayElapsed = useCallback(() => {
    if (timerState.isRunning && timerState.lastUpdate) {
      const now = Date.now()
      const currentElapsed = timerState.baseTime + (now - timerState.lastUpdate)
      setDisplayElapsed(Math.max(0, currentElapsed))
    } else {
      setDisplayElapsed(Math.max(0, timerState.baseTime))
    }
  }, [timerState.isRunning, timerState.lastUpdate, timerState.baseTime])

  // isRunning状態に基づいてリアルタイム更新を管理
  useEffect(() => {
    if (timerState.isRunning) {
      // タイマーが動いている場合：リアルタイム更新を開始
      intervalRef.current = setInterval(updateDisplayElapsed, 50) // 50ms間隔
      updateDisplayElapsed() // 即座に一度更新
    } else {
      // タイマーが停止している場合：リアルタイム更新を停止
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setDisplayElapsed(Math.max(0, timerState.baseTime))
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [timerState.isRunning, updateDisplayElapsed, timerState.baseTime])

  // Firebase接続とデータ同期
  useEffect(() => {
    const timerRef = ref(database, "timer")

    const unsubscribe = onValue(
      timerRef,
      (snapshot) => {
        try {
          const state = snapshot.val()
          if (state) {
            // Firebase からデータを取得して状態を更新
            const newTimerState: TimerState = {
              elapsed: Math.max(0, state.elapsed || 0),
              isRunning: Boolean(state.isRunning),
              lastUpdate: state.lastUpdate || Date.now(),
              sessionId: state.sessionId || "",
              baseTime: Math.max(0, state.baseTime || state.elapsed || 0), // 基準時間
            }
            
            setTimerState(newTimerState)
            setIsConnected(true)
          } else {
            // 初期状態を作成
            const initialState: TimerState = {
              elapsed: 0,
              isRunning: false,
              lastUpdate: Date.now(),
              sessionId: Math.random().toString(36).substr(2, 9),
              baseTime: 0,
            }
            set(timerRef, initialState)
            setTimerState(initialState)
            setIsConnected(true)
          }
        } catch (error) {
          console.error("Firebase connection error:", error)
          setIsConnected(false)
        }
      },
      (error) => {
        console.error("Firebase listener error:", error)
        setIsConnected(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const sendCommand = useCallback(
    async (action: string) => {
      try {
        const timerRef = ref(database, "timer")
        const now = Date.now()

        let newState: Partial<TimerState> = {}

        switch (action) {
          case "start":
            if (!timerState.isRunning) {
              // 開始時：現在の基準時間を保持し、lastUpdateを現在時刻に設定
              newState = {
                isRunning: true,
                lastUpdate: now,
                baseTime: timerState.baseTime,
                elapsed: timerState.baseTime,
              }
            }
            break
            
          case "pause":
            if (timerState.isRunning) {
              // 一時停止時：現在の経過時間を計算して基準時間として保存
              let currentElapsed = timerState.baseTime
              if (timerState.lastUpdate) {
                currentElapsed += now - timerState.lastUpdate
              }
              
              newState = {
                elapsed: Math.max(0, currentElapsed),
                isRunning: false,
                lastUpdate: now,
                baseTime: Math.max(0, currentElapsed),
              }
            }
            break
            
          case "reset":
            newState = {
              elapsed: 0,
              isRunning: false,
              lastUpdate: now,
              baseTime: 0,
            }
            break
        }

        if (Object.keys(newState).length > 0) {
          await set(timerRef, {
            ...timerState,
            ...newState,
          })
        }
      } catch (error) {
        console.error("Failed to send command:", error)
      }
    },
    [timerState],
  )

  const start = useCallback(() => sendCommand("start"), [sendCommand])
  const pause = useCallback(() => sendCommand("pause"), [sendCommand])
  const reset = useCallback(() => sendCommand("reset"), [sendCommand])

  return {
    elapsed: Math.max(0, displayElapsed),
    isRunning: timerState.isRunning,
    isConnected,
    start,
    pause,
    reset,
  }
}