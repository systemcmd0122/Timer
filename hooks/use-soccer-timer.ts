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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isController, setIsController] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const pausedTimeRef = useRef(0)
  const clientIdRef = useRef<string>(Math.random().toString(36).substr(2, 9))
  
  const timerControlRef = ref(database, "soccer-timer-control")
  const controllerRef = ref(database, "soccer-timer-controller")

  // フルスクリーン状態の監視
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  // ESCキーでフルスクリーン終了の処理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        exitFullscreen()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen])

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

  const enterFullscreen = async () => {
    try {
      const element = document.documentElement
      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen()
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen()
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen()
      }
    } catch (error) {
      console.error("フルスクリーン開始エラー:", error)
    }
  }

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen()
      }
    } catch (error) {
      console.error("フルスクリーン終了エラー:", error)
    }
  }

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
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
    isController,
    startTimer,
    stopTimer,
    resetTimer,
    toggleFullscreen,
    formatTime,
  }
}