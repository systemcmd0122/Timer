"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue, set } from "firebase/database"

interface TimerState {
  elapsed: number
  isRunning: boolean
  lastUpdate: number
  sessionId: string
}

export function useRemoteTimer() {
  const [timerState, setTimerState] = useState<TimerState>({
    elapsed: 0,
    isRunning: false,
    lastUpdate: Date.now(),
    sessionId: "",
  })
  const [isConnected, setIsConnected] = useState(false)
  const [currentElapsed, setCurrentElapsed] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // リアルタイム更新用の関数
  const updateCurrentElapsed = useCallback(() => {
    if (timerState.isRunning && timerState.lastUpdate) {
      const now = Date.now()
      const newElapsed = Math.max(0, timerState.elapsed + (now - timerState.lastUpdate))
      setCurrentElapsed(newElapsed)
    } else {
      setCurrentElapsed(timerState.elapsed)
    }
  }, [timerState])

  // タイマーが動いている時のリアルタイム更新
  useEffect(() => {
    if (timerState.isRunning) {
      intervalRef.current = setInterval(updateCurrentElapsed, 10) // 10ms間隔で更新
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setCurrentElapsed(timerState.elapsed)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState.isRunning, updateCurrentElapsed])

  useEffect(() => {
    const timerRef = ref(database, "timer")

    const unsubscribe = onValue(
      timerRef,
      (snapshot) => {
        try {
          const state = snapshot.val()
          if (state) {
            const newTimerState = {
              elapsed: Math.max(0, state.elapsed || 0),
              isRunning: state.isRunning || false,
              lastUpdate: state.lastUpdate || Date.now(),
              sessionId: state.sessionId || "",
            }
            
            setTimerState(newTimerState)
            setIsConnected(true)
          } else {
            // Initialize timer state if it doesn't exist
            const initialState = {
              elapsed: 0,
              isRunning: false,
              lastUpdate: Date.now(),
              sessionId: Math.random().toString(36).substr(2, 9),
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
    async (action: string, elapsed?: number) => {
      try {
        const timerRef = ref(database, "timer")
        const now = Date.now()

        let newState: Partial<TimerState> = {}

        switch (action) {
          case "start":
            // 現在の経過時間を保存して開始
            let startElapsed = timerState.elapsed
            if (timerState.isRunning && timerState.lastUpdate) {
              startElapsed += now - timerState.lastUpdate
            }
            newState = {
              elapsed: Math.max(0, startElapsed),
              isRunning: true,
              lastUpdate: now,
            }
            break
          case "pause":
            // 現在の経過時間を計算して一時停止
            let pauseElapsed = timerState.elapsed
            if (timerState.isRunning && timerState.lastUpdate) {
              pauseElapsed += now - timerState.lastUpdate
            }
            newState = {
              elapsed: Math.max(0, pauseElapsed),
              isRunning: false,
              lastUpdate: now,
            }
            break
          case "reset":
            newState = {
              elapsed: 0,
              isRunning: false,
              lastUpdate: now,
            }
            break
        }

        await set(timerRef, {
          ...timerState,
          ...newState,
        })
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
    elapsed: Math.max(0, currentElapsed),
    isRunning: timerState.isRunning,
    isConnected,
    start,
    pause,
    reset,
  }
}