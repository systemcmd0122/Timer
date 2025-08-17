"use client"

import { useState, useEffect, useRef } from "react"
import { database } from "@/lib/firebase"
import { ref, set, onValue, off } from "firebase/database"

export type TimerState = "stopped" | "running" | "paused"

interface TimerControl {
  state: TimerState
  lastStateChange: number
  controllerId?: string
}

export function useSoccerTimer() {
  const [currentTime, setCurrentTime] = useState(0)
  const [state, setState] = useState<TimerState>("stopped")
  const [isConnected, setIsConnected] = useState(false)
  const [isController, setIsController] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const pausedTimeRef = useRef(0)
  const clientIdRef = useRef<string>(Math.random().toString(36).substr(2, 9))
  
  const timerControlRef = ref(database, "soccer-timer-control")
  const controllerRef = ref(database, "soccer-timer-controller")

  // コントローラー選出
  useEffect(() => {
    let controllerCheckInterval: NodeJS.Timeout

    const checkController = async () => {
      try {
        const controllerData = { 
          id: clientIdRef.current, 
          heartbeat: Date.now() 
        }
        await set(controllerRef, controllerData)
        setIsController(true)
        console.log("コントローラーになりました")
      } catch (error) {
        console.error("コントローラー設定エラー:", error)
        setIsController(false)
      }
    }

    const startHeartbeat = () => {
      controllerCheckInterval = setInterval(async () => {
        if (isController) {
          try {
            await set(controllerRef, {
              id: clientIdRef.current,
              heartbeat: Date.now()
            })
          } catch (error) {
            console.error("ハートビート送信エラー:", error)
          }
        }
      }, 3000)
    }

    checkController()
    startHeartbeat()

    return () => {
      if (controllerCheckInterval) {
        clearInterval(controllerCheckInterval)
      }
    }
  }, [isController])

  // タイマー状態の監視
  useEffect(() => {
    const unsubscribe = onValue(
      timerControlRef,
      (snapshot) => {
        const data = snapshot.val() as TimerControl | null
        if (data) {
          const newState = data.state
          
          if (state !== newState) {
            const now = Date.now()
            
            if (newState === "running") {
              if (state === "stopped") {
                startTimeRef.current = now
                pausedTimeRef.current = 0
                setCurrentTime(0)
              } else if (state === "paused") {
                startTimeRef.current = now - (pausedTimeRef.current * 1000)
              }
            } else if (newState === "paused" && state === "running") {
              const elapsed = Math.floor((now - (startTimeRef.current || now)) / 1000)
              pausedTimeRef.current = elapsed
              setCurrentTime(elapsed)
            } else if (newState === "stopped") {
              startTimeRef.current = null
              pausedTimeRef.current = 0
              setCurrentTime(0)
            }
            
            setState(newState)
          }
          
          setIsConnected(true)
        }
      },
      (error) => {
        console.error("Firebase接続エラー:", error)
        setIsConnected(false)
      }
    )

    return () => off(timerControlRef)
  }, [state])

  // ローカルタイマーの更新
  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const now = Date.now()
          const elapsed = Math.floor((now - startTimeRef.current) / 1000)
          setCurrentTime(elapsed)
        }
      }, 100)
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

  const updateFirebaseControl = async (newState: TimerState) => {
    try {
      const controlData: TimerControl = {
        state: newState,
        lastStateChange: Date.now(),
        controllerId: clientIdRef.current
      }
      await set(timerControlRef, controlData)
    } catch (error) {
      console.error("Firebase更新エラー:", error)
    }
  }

  const startTimer = () => {
    if (!isController) return
    
    if (state === "stopped" || state === "paused") {
      updateFirebaseControl("running")
    }
  }

  const stopTimer = () => {
    if (!isController) return
    
    if (state === "running") {
      updateFirebaseControl("paused")
    }
  }

  const resetTimer = () => {
    if (!isController) return
    updateFirebaseControl("stopped")
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return {
    currentTime,
    state,
    isConnected,
    isController,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime,
  }
}