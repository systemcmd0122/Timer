"use client"

import { useState, useEffect, useCallback } from "react"

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

  // Sync with server every 500ms
  useEffect(() => {
    const syncTimer = setInterval(async () => {
      try {
        const response = await fetch("/api/timer")
        const state = await response.json()

        // Calculate current elapsed time if timer is running
        let currentElapsed = state.elapsed
        if (state.isRunning) {
          currentElapsed += Date.now() - state.lastUpdate
        }

        currentElapsed = Math.max(0, currentElapsed)

        setTimerState({
          ...state,
          elapsed: currentElapsed,
        })
        setIsConnected(true)
      } catch (error) {
        console.error("Failed to sync timer:", error)
        setIsConnected(false)
      }
    }, 500)

    return () => clearInterval(syncTimer)
  }, [])

  const sendCommand = useCallback(async (action: string, elapsed?: number) => {
    try {
      const response = await fetch("/api/timer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, elapsed }),
      })

      if (response.ok) {
        const state = await response.json()
        setTimerState(state)
      }
    } catch (error) {
      console.error("Failed to send command:", error)
    }
  }, [])

  const start = useCallback(() => sendCommand("start"), [sendCommand])
  const pause = useCallback(() => sendCommand("pause"), [sendCommand])
  const reset = useCallback(() => sendCommand("reset"), [sendCommand])

  return {
    elapsed: Math.max(0, timerState.elapsed), // Additional safety check for negative values
    isRunning: timerState.isRunning,
    isConnected,
    start,
    pause,
    reset,
  }
}
