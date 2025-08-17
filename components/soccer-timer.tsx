"use client"

import { useSoccerTimer } from "@/hooks/use-soccer-timer"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Maximize, Minimize, Wifi, WifiOff } from "lucide-react"

export function SoccerTimer() {
  const {
    currentTime,
    state,
    isFullscreen,
    isConnected,
    startTimer,
    stopTimer,
    resetTimer,
    toggleFullscreen,
    formatTime,
  } = useSoccerTimer()

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="text-black text-[12rem] font-mono font-bold leading-none mb-8">{formatTime(currentTime)}</div>
          <Button onClick={toggleFullscreen} variant="outline" size="lg" className="text-2xl px-8 py-4 bg-transparent">
            <Minimize className="w-8 h-8 mr-2" />
            全画面終了
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-black">サッカータイマー</h1>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="w-6 h-6 text-green-600" />
                <span className="text-green-600 font-medium">Firebase同期中</span>
              </>
            ) : (
              <>
                <WifiOff className="w-6 h-6 text-red-600" />
                <span className="text-red-600 font-medium">接続中...</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-white border-4 border-black rounded-lg p-12 mb-8">
          <div className="text-center">
            <div className="text-black text-[8rem] font-mono font-bold leading-none mb-4">
              {formatTime(currentTime)}
            </div>
            <div className="text-2xl text-gray-600 mb-8">
              状態: {state === "running" ? "実行中" : state === "paused" ? "一時停止" : "停止中"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={state === "running" ? stopTimer : startTimer}
            variant={state === "running" ? "destructive" : "default"}
            size="lg"
            className="text-xl py-6"
          >
            {state === "running" ? (
              <>
                <Pause className="w-6 h-6 mr-2" />
                ストップ
              </>
            ) : (
              <>
                <Play className="w-6 h-6 mr-2" />
                スタート
              </>
            )}
          </Button>

          <Button onClick={resetTimer} variant="outline" size="lg" className="text-xl py-6 bg-transparent">
            <RotateCcw className="w-6 h-6 mr-2" />
            リセット
          </Button>

          <Button onClick={toggleFullscreen} variant="outline" size="lg" className="text-xl py-6 bg-transparent">
            <Maximize className="w-6 h-6 mr-2" />
            全画面
          </Button>
        </div>
      </div>
    </div>
  )
}
