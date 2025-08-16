"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue, set } from "firebase/database"

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
  const animationFrameRef = useRef<number | null>(null)
  const isUpdatingRef = useRef(false) // Firebase更新中フラグ
  const lastSyncTimeRef = useRef(0) // 最後の同期時間

  // 高精度リアルタイム表示更新関数
  const updateCurrentElapsed = useCallback(() => {
    if (remoteState.isRunning && remoteState.startTimestamp > 0) {
      const now = performance.now()
      const elapsed = remoteState.baseElapsed + (now - remoteState.startTimestamp)
      setCurrentElapsed(Math.max(0, elapsed))
      
      // 次のフレームで再度実行
      if (remoteState.isRunning) {
        animationFrameRef.current = requestAnimationFrame(updateCurrentElapsed)
      }
    } else {
      setCurrentElapsed(Math.max(0, remoteState.baseElapsed))
    }
  }, [remoteState.isRunning, remoteState.baseElapsed, remoteState.startTimestamp])

  // リアルタイム更新の管理
  useEffect(() => {
    // アニメーションフレームをキャンセル
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // インターバルをクリア
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (remoteState.isRunning) {
      // 高精度アニメーションフレーム更新を開始
      animationFrameRef.current = requestAnimationFrame(updateCurrentElapsed)
      
      // フォールバック用の低頻度インターバル
      intervalRef.current = setInterval(() => {
        if (remoteState.startTimestamp > 0) {
          const now = performance.now()
          const elapsed = remoteState.baseElapsed + (now - remoteState.startTimestamp)
          setCurrentElapsed(Math.max(0, elapsed))
        }
      }, 16) // 約60fps
    } else {
      // 停止中は一度だけ更新
      updateCurrentElapsed()
    }

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
          const now = performance.now()
          
          if (data) {
            // タイムスタンプを現在の高精度時間に変換
            const adjustedStartTimestamp = data.isRunning && data.startTimestamp 
              ? now - (Date.now() - data.startTimestamp)
              : 0

            const newState: FirebaseTimerState = {
              baseElapsed: Math.max(0, data.baseElapsed || 0),
              isRunning: Boolean(data.isRunning),
              startTimestamp: adjustedStartTimestamp,
              lastUpdate: data.lastUpdate || Date.now(),
              sessionId: data.sessionId || "",
            }
            
            // 重複更新を防ぐ
            if (lastSyncTimeRef.current !== data.lastUpdate) {
              setRemoteState(newState)
              lastSyncTimeRef.current = data.lastUpdate
              setIsConnected(true)
              
              console.log("Firebase state synchronized:", {
                ...newState,
                timeDiff: now - adjustedStartTimestamp
              })
            }
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
            set(timerRef, {
              ...initialState,
              startTimestamp: initialState.startTimestamp || null
            }).then(() => {
              isUpdatingRef.current = false
              setRemoteState(initialState)
              setIsConnected(true)
              console.log("Firebase initialized:", initialState)
            }).catch((error) => {
              isUpdatingRef.current = false
              console.error("Failed to initialize timer:", error)
              setIsConnected(false)
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
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  // コマンド送信関数（デバウンス機能付き）
  const sendCommand = useCallback(
    async (action: string) => {
      if (isUpdatingRef.current) {
        console.log("Update in progress, skipping command:", action)
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
              newState = {
                baseElapsed: remoteState.baseElapsed,
                isRunning: true,
                startTimestamp: now,
                lastUpdate: now,
                sessionId: remoteState.sessionId,
              }
              console.log("Sending start command:", newState)
            } else {
              isUpdatingRef.current = false
              return
            }
            break

          case "pause":
            if (remoteState.isRunning && remoteState.startTimestamp > 0) {
              const currentElapsedTime = remoteState.baseElapsed + (performance.now() - remoteState.startTimestamp)
              
              newState = {
                baseElapsed: Math.max(0, currentElapsedTime),
                isRunning: false,
                startTimestamp: 0,
                lastUpdate: now,
                sessionId: remoteState.sessionId,
              }
              console.log("Sending pause command:", newState)
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
            console.log("Sending reset command:", newState)
            break

          default:
            isUpdatingRef.current = false
            console.warn("Unknown command:", action)
            return
        }

        await set(timerRef, newState)
        console.log(`Command ${action} sent successfully`)
        
        // 短い遅延後にフラグをクリア
        setTimeout(() => {
          isUpdatingRef.current = false
        }, 50)

      } catch (error) {
        console.error("Failed to send command:", error)
        isUpdatingRef.current = false
        setIsConnected(false)
      }
    },
    [remoteState]
  )

  const start = useCallback(() => {
    console.log("Remote start command triggered")
    sendCommand("start")
  }, [sendCommand])

  const pause = useCallback(() => {
    console.log("Remote pause command triggered")
    sendCommand("pause")
  }, [sendCommand])

  const reset = useCallback(() => {
    console.log("Remote reset command triggered")
    sendCommand("reset")
  }, [sendCommand])

  // メモ化されたreturnオブジェクト
  const timerInterface = useMemo(() => ({
    elapsed: Math.max(0, currentElapsed),
    isRunning: remoteState.isRunning,
    isConnected,
    start,
    pause,
    reset,
  }), [currentElapsed, remoteState.isRunning, isConnected, start, pause, reset])

  return timerInterface
}