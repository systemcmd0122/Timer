"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { saveTimerState, subscribeToTimerState, type TimerState } from "@/lib/firebase"

interface TimerContextType {
  isRunning: boolean
  elapsedTime: number
  formattedTime: string
  remoteMode: boolean
  sessionId: string | null
  setSessionId: (id: string) => void
  startTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
  toggleRemoteMode: () => void
  addMinute: () => void
  subtractMinute: () => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export const useTimer = () => {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider")
  }
  return context
}

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionIdState] = useState<string | null>(null)
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    startTime: null,
    elapsedTime: 0,
    lastUpdated: Date.now(),
    remoteMode: false,
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
    }

    if (sessionId) {
      unsubscribeRef.current = subscribeToTimerState((state) => {
        if (state) {
          setTimerState(state)
        }
      }, sessionId)
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [sessionId])

  useEffect(() => {
    const unsubscribe = subscribeToTimerState((state) => {
      if (state) {
        setTimerState(state)
      }
    })

    return unsubscribe
  }, [])

  // ローカルタイマーの更新
  useEffect(() => {
    if (timerState.isRunning) {
      intervalRef.current = setInterval(() => {
        setTimerState((prev) => {
          const newState = {
            ...prev,
            elapsedTime: prev.startTime ? Date.now() - prev.startTime : 0,
            lastUpdated: Date.now(),
          }
          saveTimerState(newState, sessionId)
          return newState
        })
      }, 50) // 50msごとに更新でよりリアルタイム
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
  }, [timerState.isRunning, timerState.startTime, sessionId])

  const updateState = (newState: TimerState) => {
    setTimerState(newState)
    if (sessionId) {
      saveTimerState(newState, sessionId)
    }
  }

  const startTimer = () => {
    const now = Date.now()
    const newState: TimerState = {
      ...timerState,
      isRunning: true,
      startTime: now - timerState.elapsedTime,
      elapsedTime: timerState.elapsedTime,
      lastUpdated: now,
    }
    updateState(newState)
  }

  const stopTimer = () => {
    const newState: TimerState = {
      ...timerState,
      isRunning: false,
      lastUpdated: Date.now(),
    }
    updateState(newState)
  }

  const resetTimer = () => {
    const newState: TimerState = {
      ...timerState,
      isRunning: false,
      startTime: null,
      elapsedTime: 0,
      lastUpdated: Date.now(),
    }
    updateState(newState)
  }

  const toggleRemoteMode = () => {
    const newState: TimerState = {
      ...timerState,
      remoteMode: !timerState.remoteMode,
      lastUpdated: Date.now(),
    }
    updateState(newState)
  }

  const addMinute = () => {
    const now = Date.now()
    const newElapsedTime = timerState.elapsedTime + 60000 // 1分 = 60000ms
    const newState: TimerState = {
      ...timerState,
      elapsedTime: newElapsedTime,
      startTime: timerState.isRunning ? now - newElapsedTime : timerState.startTime,
      lastUpdated: now,
    }
    updateState(newState)
  }

  const subtractMinute = () => {
    const now = Date.now()
    const newElapsedTime = Math.max(0, timerState.elapsedTime - 60000) // 負の値を防ぐ
    const newState: TimerState = {
      ...timerState,
      elapsedTime: newElapsedTime,
      startTime: timerState.isRunning ? now - newElapsedTime : timerState.startTime,
      lastUpdated: now,
    }
    updateState(newState)
  }

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const currentElapsedTime =
    timerState.isRunning && timerState.startTime ? Date.now() - timerState.startTime : timerState.elapsedTime

  const setSessionId = (id: string) => {
    setSessionIdState(id)
  }

  return (
    <TimerContext.Provider
      value={{
        isRunning: timerState.isRunning,
        elapsedTime: Math.max(0, currentElapsedTime),
        formattedTime: formatTime(currentElapsedTime),
        remoteMode: timerState.remoteMode,
        sessionId,
        setSessionId,
        startTimer,
        stopTimer,
        resetTimer,
        toggleRemoteMode,
        addMinute,
        subtractMinute,
      }}
    >
      {children}
    </TimerContext.Provider>
  )
}
