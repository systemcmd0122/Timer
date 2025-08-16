"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue, set, serverTimestamp } from "firebase/database"

interface FirebaseTimerState {
  baseElapsed: number // 基準の経過時間
  isRunning: boolean
  startTimestamp: number // サーバーのタイムスタンプまたはローカル時刻
  lastUpdate: number
  sessionId: string
}

export function useRemoteTimer() {
  const [remoteState, setRemoteState] = useState<FirebaseTimerState>({
    baseElapsed: 0,
    isRunning: false,
    startTimestamp: 0,
    lastUpdate: Date.now(),
    sessionId: "",
  })
  
  const [currentElapsed, setCurrentElapsed] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isUpdatingRef = useRef(false) // Firebase更新中フラグ

  // リアルタイム表示更新関数
  const updateCurrentElapsed = useCallback(() => {
    if (remoteState.isRunning && remoteState.startTimestamp > 0) {
      const now = Date.now()
      const elapsed = remoteState.baseElapsed + (now - remoteState.startTimestamp)
      setCurrentElapsed(Math.max(0, elapsed))
    } else {
      setCurrentElapsed(Math.max(0, remoteState.baseElapsed))
    }
  }, [remoteState.isRunning, remoteState.baseElapsed, remoteState.startTimestamp])

  // リアルタイム更新の管理
  useEffect(() => {
    // インターバルをクリア
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (remoteState.isRunning) {
      // タイマーが動いている時は高頻度で更新
      intervalRef.current = setInterval(updateCurrentElapsed, 50) // 50ms間隔
      updateCurrentElapsed() // 即座に一度実行
    } else {
      // 停止中は一度だけ更新
      updateCurrentElapsed()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [remoteState.isRunning, updateCurrentElapsed])

  // Firebase接続とリアルタイム同期
  useEffect(() => {
    const timerRef = ref(database, "timer")

    const unsubscribe = onValue(
      timerRef,
      (snapshot) => {
        // 自分が更新中の場合は無視（無限ループ防止）
        if (isUpdatingRef.current) {
          return
        }

        try {
          const data = snapshot.val()
          
          if (data) {
            const newState: FirebaseTimerState = {
              baseElapsed: Math.max(0, data.baseElapsed || 0),
              isRunning: Boolean(data.isRunning),
              startTimestamp: data.startTimestamp || Date.now(),
              lastUpdate: data.lastUpdate || Date.now(),
              sessionId: data.sessionId || "",
            }
            
            setRemoteState(newState)
            setIsConnected(true)
            
            console.log("Firebase state updated:", newState) // デバッグログ
          } else {
            // 初期データがない場合は作成
            const initialState: FirebaseTimerState = {
              baseElapsed: 0,
              isRunning: false,
              startTimestamp: 0,
              lastUpdate: Date.now(),
              sessionId: Math.random().toString(36).substr(2, 9),
            }
            
            isUpdatingRef.current = true
            set(timerRef, initialState).then(() => {
              isUpdatingRef.current = false
              setRemoteState(initialState)
              setIsConnected(true)
            }).catch((error) => {
              isUpdatingRef.current = false
              console.error("Failed to initialize timer:", error)
            })
          }
        } catch (error) {
          console.error("Firebase data processing error:", error)
          setIsConnected(false)
        }
      },
      (error) => {
        console.error("Firebase listener error:", error)
        setIsConnected(false)
      }
    )

    return () => {
      unsubscribe()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  // コマンド送信関数
  const sendCommand = useCallback(
    async (action: string) => {
      if (isUpdatingRef.current) {
        console.log("Update in progress, skipping...")
        return
      }

      try {
        isUpdatingRef.current = true
        const timerRef = ref(database, "timer")
        const now = Date.now()

        let newState: Partial<FirebaseTimerState>

        switch (action) {
          case "start":
            if (!remoteState.isRunning) {
              // 開始：現在の累積時間を基準として、新しい開始時刻を設定
              newState = {
                baseElapsed: remoteState.baseElapsed,
                isRunning: true,
                startTimestamp: now,
                lastUpdate: now,
                sessionId: remoteState.sessionId,
              }
              console.log("Starting timer with state:", newState)
            } else {
              isUpdatingRef.current = false
              return
            }
            break

          case "pause":
            if (remoteState.isRunning && remoteState.startTimestamp > 0) {
              // 一時停止：現在の経過時間を計算して基準時間として保存
              const currentElapsedTime = remoteState.baseElapsed + (now - remoteState.startTimestamp)
              
              newState = {
                baseElapsed: Math.max(0, currentElapsedTime),
                isRunning: false,
                startTimestamp: 0,
                lastUpdate: now,
                sessionId: remoteState.sessionId,
              }
              console.log("Pausing timer with state:", newState)
            } else {
              isUpdatingRef.current = false
              return
            }
            break

          case "reset":
            newState = {
              baseElapsed: 0,
              isRunning: false,
              startTimestamp: 0,
              lastUpdate: now,
              sessionId: remoteState.sessionId,
            }
            console.log("Resetting timer with state:", newState)
            break

          default:
            isUpdatingRef.current = false
            return
        }

        await set(timerRef, newState)
        console.log(`Command ${action} sent successfully`)
        
        // 短い遅延後にフラグをクリア
        setTimeout(() => {
          isUpdatingRef.current = false
        }, 100)

      } catch (error) {
        console.error("Failed to send command:", error)
        isUpdatingRef.current = false
      }
    },
    [remoteState]
  )

  const start = useCallback(() => {
    console.log("Start command triggered")
    sendCommand("start")
  }, [sendCommand])

  const pause = useCallback(() => {
    console.log("Pause command triggered")
    sendCommand("pause")
  }, [sendCommand])

  const reset = useCallback(() => {
    console.log("Reset command triggered")
    sendCommand("reset")
  }, [sendCommand])

  return {
    elapsed: Math.max(0, currentElapsed),
    isRunning: remoteState.isRunning,
    isConnected,
    start,
    pause,
    reset,
  }
}