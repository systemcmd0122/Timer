"use client"

import { useState, useEffect, useCallback } from "react"
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

  useEffect(() => {
    const timerRef = ref(database, "timer")

    const unsubscribe = onValue(
      timerRef,
      (snapshot) => {
        try {
          const state = snapshot.val()
          if (state) {
            // Calculate current elapsed time if timer is running
            let currentElapsed = state.elapsed || 0
            if (state.isRunning && state.lastUpdate) {
              currentElapsed += Date.now() - state.lastUpdate
            }

            currentElapsed = Math.max(0, currentElapsed)

            setTimerState({
              elapsed: currentElapsed,
              isRunning: state.isRunning || false,
              lastUpdate: state.lastUpdate || Date.now(),
              sessionId: state.sessionId || "",
            })
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
            newState = {
              isRunning: true,
              lastUpdate: now,
            }
            break
          case "pause":
            // Calculate final elapsed time when pausing
            let finalElapsed = timerState.elapsed
            if (timerState.isRunning) {
              finalElapsed += now - timerState.lastUpdate
            }
            newState = {
              elapsed: Math.max(0, finalElapsed),
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
    elapsed: Math.max(0, timerState.elapsed),
    isRunning: timerState.isRunning,
    isConnected,
    start,
    pause,
    reset,
  }
}
