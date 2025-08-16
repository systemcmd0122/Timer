"use client"

import { TimerDisplay } from "@/components/timer-display"
import { ProgressBar } from "@/components/progress-bar"
import { Controls } from "@/components/controls"
import { useStopwatch } from "@/hooks/use-stopwatch"
import { useRemoteTimer } from "@/hooks/use-remote-timer"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Maximize, Minimize, Monitor, Wifi, WifiOff } from "lucide-react"

export default function SoccerStopwatch() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isStreamingMode, setIsStreamingMode] = useState(false)
  const [isRemoteMode, setIsRemoteMode] = useState(false)

  const localTimer = useStopwatch()
  const remoteTimer = useRemoteTimer()
  const timer = isRemoteMode ? remoteTimer : localTimer

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("overlay") === "true" || urlParams.get("streaming") === "true") {
      setIsStreamingMode(true)
    }
    if (urlParams.get("remote") === "true") {
      setIsRemoteMode(true)
    }
  }, [])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const toggleStreamingMode = () => {
    setIsStreamingMode(!isStreamingMode)
    const url = new URL(window.location.href)
    if (!isStreamingMode) {
      url.searchParams.set("overlay", "true")
      if (isRemoteMode) {
        url.searchParams.set("remote", "true")
      }
    } else {
      url.searchParams.delete("overlay")
    }
    window.history.replaceState({}, "", url.toString())
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const toggleRemoteMode = () => {
    setIsRemoteMode(!isRemoteMode)
    const url = new URL(window.location.href)
    if (!isRemoteMode) {
      url.searchParams.set("remote", "true")
    } else {
      url.searchParams.delete("remote")
    }
    window.history.replaceState({}, "", url.toString())
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        if (timer.isRunning) {
          timer.pause()
        } else {
          timer.start()
        }
      } else if (e.code === "KeyR") {
        e.preventDefault()
        timer.reset()
      } else if (e.code === "KeyF") {
        e.preventDefault()
        toggleFullscreen()
      } else if (e.code === "KeyS") {
        e.preventDefault()
        toggleStreamingMode()
      } else if (e.code === "KeyW") {
        e.preventDefault()
        toggleRemoteMode()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [timer.isRunning, timer.start, timer.pause, timer.reset, isStreamingMode])

  if (isStreamingMode) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <TimerDisplay elapsed={timer.elapsed} isFullscreen={true} isStreamingMode={true} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex justify-end gap-2">
          <Button
            onClick={toggleRemoteMode}
            variant={isRemoteMode ? "default" : "ghost"}
            size="sm"
            className={`text-gray-600 hover:text-gray-900 ${isRemoteMode ? "bg-blue-100 text-blue-700" : ""}`}
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

        {isRemoteMode && (
          <div className="text-center">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
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

        <div className="rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 text-center transition-all duration-300 bg-white">
          <div className="mb-4 sm:mb-6">
            <TimerDisplay elapsed={timer.elapsed} isFullscreen={isFullscreen} />
          </div>
          <ProgressBar elapsed={timer.elapsed} isFullscreen={isFullscreen} />
        </div>

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

        <div className="text-center text-xs sm:text-sm text-gray-600">
          <p>Keyboard: Space = Start/Pause, R = Reset, F = Fullscreen, S = Streaming, W = Remote</p>
        </div>
      </div>
    </div>
  )
}