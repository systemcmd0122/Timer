"use client"

import { TimerDisplay } from "@/components/timer-display"
import { ProgressBar } from "@/components/progress-bar"
import { Controls } from "@/components/controls"
import { useStopwatch } from "@/hooks/use-stopwatch"
import { useRemoteTimer } from "@/hooks/use-remote-timer"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Maximize, Minimize, Monitor, Wifi, WifiOff } from "lucide-react"

export default function SoccerStopwatch() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isStreamingMode, setIsStreamingMode] = useState(false)
  const [isRemoteMode, setIsRemoteMode] = useState(false)

  // 両方のタイマーを初期化
  const localTimer = useStopwatch()
  const remoteTimer = useRemoteTimer()
  
  // 現在アクティブなタイマーを選択（メモ化）
  const timer = useMemo(() => 
    isRemoteMode ? remoteTimer : localTimer,
    [isRemoteMode, remoteTimer, localTimer]
  )

  // URL パラメータから初期状態を設定
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("overlay") === "true" || urlParams.get("streaming") === "true") {
      setIsStreamingMode(true)
    }
    if (urlParams.get("remote") === "true") {
      setIsRemoteMode(true)
    }
  }, [])

  // フルスクリーン切り替え
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error("Fullscreen error:", error)
    }
  }, [])

  // ストリーミングモード切り替え
  const toggleStreamingMode = useCallback(() => {
    setIsStreamingMode(prev => {
      const newMode = !prev
      const url = new URL(window.location.href)
      if (newMode) {
        url.searchParams.set("overlay", "true")
        if (isRemoteMode) {
          url.searchParams.set("remote", "true")
        }
      } else {
        url.searchParams.delete("overlay")
      }
      window.history.replaceState({}, "", url.toString())
      return newMode
    })
  }, [isRemoteMode])

  // リモートモード切り替え
  const toggleRemoteMode = useCallback(() => {
    setIsRemoteMode(prev => {
      const newRemoteMode = !prev
      
      const url = new URL(window.location.href)
      if (newRemoteMode) {
        url.searchParams.set("remote", "true")
      } else {
        url.searchParams.delete("remote")
      }
      window.history.replaceState({}, "", url.toString())
      
      console.log("Remote mode toggled:", newRemoteMode)
      return newRemoteMode
    })
  }, [])

  // フルスクリーン状態の監視
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // キーボードショートカット
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 入力要素にフォーカスがある場合はスキップ
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return
      }

      switch (e.code) {
        case "Space":
          e.preventDefault()
          if (timer.isRunning) {
            console.log("Keyboard: Pausing timer")
            timer.pause()
          } else {
            console.log("Keyboard: Starting timer")
            timer.start()
          }
          break
        case "KeyR":
          e.preventDefault()
          console.log("Keyboard: Resetting timer")
          timer.reset()
          break
        case "KeyF":
          e.preventDefault()
          toggleFullscreen()
          break
        case "KeyS":
          e.preventDefault()
          toggleStreamingMode()
          break
        case "KeyW":
          e.preventDefault()
          toggleRemoteMode()
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [timer.isRunning, timer.start, timer.pause, timer.reset, toggleFullscreen, toggleStreamingMode, toggleRemoteMode])

  // メモ化されたデバッグ情報
  const debugInfo = useMemo(() => ({
    mode: isRemoteMode ? 'Remote' : 'Local',
    running: timer.isRunning ? 'Yes' : 'No',
    elapsed: Math.floor(timer.elapsed / 1000),
    connected: isRemoteMode ? (remoteTimer.isConnected ? 'Yes' : 'No') : 'N/A'
  }), [isRemoteMode, timer.isRunning, timer.elapsed, remoteTimer.isConnected])

  // ストリーミングモード表示
  if (isStreamingMode) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <TimerDisplay elapsed={timer.elapsed} isFullscreen={true} isStreamingMode={true} />
        {/* デバッグ情報 */}
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded text-xs font-mono">
          Mode: {debugInfo.mode} | 
          Running: {debugInfo.running} | 
          Elapsed: {debugInfo.elapsed}s
          {isRemoteMode && ` | Connected: ${debugInfo.connected}`}
        </div>
      </div>
    )
  }

  // メイン表示
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto space-y-4 sm:space-y-6">
        {/* ツールバー */}
        <div className="flex justify-end gap-2">
          <Button
            onClick={toggleRemoteMode}
            variant={isRemoteMode ? "default" : "ghost"}
            size="sm"
            className={`text-gray-600 hover:text-gray-900 transition-colors ${isRemoteMode ? "bg-blue-100 text-blue-700" : ""}`}
          >
            {isRemoteMode ? (
              <>{remoteTimer.isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}</>
            ) : (
              <Wifi className="w-4 h-4" />
            )}
          </Button>
          <Button onClick={toggleStreamingMode} variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            <Monitor className="w-4 h-4" />
          </Button>
          <Button onClick={toggleFullscreen} variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>

        {/* リモート接続状態表示 */}
        {isRemoteMode && (
          <div className="text-center">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors ${
                remoteTimer.isConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {remoteTimer.isConnected ? (
                <>
                  <Wifi className="w-3 h-3" />
                  Remote Connected
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  Remote Disconnected
                </>
              )}
            </div>
          </div>
        )}

        {/* タイマー表示 */}
        <div className="rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 text-center transition-all duration-300 bg-white">
          <div className="mb-4 sm:mb-6">
            <TimerDisplay elapsed={timer.elapsed} isFullscreen={isFullscreen} />
          </div>
          <ProgressBar elapsed={timer.elapsed} isFullscreen={isFullscreen} />
        </div>

        {/* コントロール */}
        <Controls
          isRunning={timer.isRunning}
          onStart={timer.start}
          onPause={timer.pause}
          onReset={timer.reset}
          onAddMinute={isRemoteMode ? () => {} : localTimer.addMinute}
          onSubtractMinute={isRemoteMode ? () => {} : localTimer.subtractMinute}
          onJumpTo45={isRemoteMode ? () => {} : () => localTimer.jumpTo(45 * 60 * 1000)}
          onJumpTo90={isRemoteMode ? () => {} : () => localTimer.jumpTo(90 * 60 * 1000)}
          isFullscreen={isFullscreen}
          isRemoteMode={isRemoteMode}
        />

        {/* ヘルプテキスト */}
        <div className="text-center text-xs sm:text-sm text-gray-600">
          <p>Keyboard: Space = Start/Pause, R = Reset, F = Fullscreen, S = Streaming, W = Remote</p>
          {/* デバッグ情報 */}
          <div className="mt-2 text-xs text-gray-400 font-mono">
            Mode: {debugInfo.mode} | 
            Running: {debugInfo.running} | 
            Elapsed: {debugInfo.elapsed}s
            {isRemoteMode && ` | Connected: ${debugInfo.connected}`}
          </div>
        </div>
      </div>
    </div>
  )
}