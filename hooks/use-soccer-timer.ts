"use client"

import { useState, useEffect, useRef } from "react"
import { database } from "@/lib/firebase"
import { ref, set, onValue, off } from "firebase/database"

export type TimerState = "stopped" | "running" | "paused"

interface TimerData {
  currentTime: number
  state: TimerState
  lastUpdated: number
}

export function useSoccerTimer() {
  const [currentTime, setCurrentTime] = useState(0)
  const [state, setState] = useState<TimerState>("stopped")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = ref(database, "soccer-timer")

  useEffect(() => {
    const unsubscribe = onValue(
      timerRef,
      (snapshot) => {
        const data = snapshot.val() as TimerData | null
        if (data) {
          const now = Date.now()
          const timeDiff = now - data.lastUpdated

          if (data.state === "running") {
            setCurrentTime(data.currentTime + Math.floor(timeDiff / 1000))
            setState("running")
          } else {
            setCurrentTime(data.currentTime)
            setState(data.state)
          }
          setIsConnected(true)
        }
      },
      (error) => {
        console.error("Firebase接続エラー:", error)
        setIsConnected(false)
      },
    )

    return () => off(timerRef)
  }, [])

  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 1
          updateFirebase(newTime, "running")
          return newTime
        })
      }, 1000)
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
  }, [state])

  const updateFirebase = async (newTime: number, newState: TimerState) => {
    try {
      const data: TimerData = {
        currentTime: newTime,
        state: newState,
        lastUpdated: Date.now(),
      }
      await set(timerRef, data)
    } catch (error) {
      console.error("Firebase更新エラー:", error)
    }
  }

  const startTimer = () => {
    setState("running")
    updateFirebase(currentTime, "running")
  }

  const stopTimer = () => {
    setState("paused")
    updateFirebase(currentTime, "paused")
  }

  const resetTimer = () => {
    const newTime = 0
    setCurrentTime(newTime)
    setState("stopped")
    updateFirebase(newTime, "stopped")
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return {
    currentTime,
    state,
    isFullscreen,
    isConnected,
    startTimer,
    stopTimer,
    resetTimer,
    toggleFullscreen,
    formatTime,
  }
}
