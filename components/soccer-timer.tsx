"use client"

import { useSoccerTimer } from "@/hooks/use-soccer-timer"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Maximize, Wifi, WifiOff, Settings, Eye, Monitor, Gamepad2 } from "lucide-react"
import { useState } from "react"

export function SoccerTimer() {
  const {
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
  } = useSoccerTimer()

  const [viewMode, setViewMode] = useState<'display' | 'control'>('display')

  // フルスクリーン表示モード
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="text-black text-[20rem] font-mono font-bold leading-none">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>
    )
  }

  // 操作専用画面
  if (viewMode === 'control') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">タイマー操作</h1>
            <div className="flex items-center gap-6">
              <Button
                onClick={() => setViewMode('display')}
                variant="outline"
                size="lg"
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                <Monitor className="w-5 h-5 mr-2" />
                表示画面
              </Button>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <Wifi className="w-6 h-6 text-green-400" />
                    <span className="text-green-400 font-medium">接続中</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-6 h-6 text-red-400" />
                    <span className="text-red-400 font-medium">切断</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-8 mb-8">
            <div className="text-center">
              <div className="text-green-400 text-[8rem] font-mono font-bold leading-none mb-6">
                {formatTime(currentTime)}
              </div>
              <div className="text-3xl text-gray-300 mb-8">
                {state === "running" ? "⏱️ 実行中" : state === "paused" ? "⏸️ 一時停止" : "⏹️ 停止中"}
              </div>
            </div>
          </div>

          {isController ? (
            <>
              <div className="grid grid-cols-1 gap-6 mb-8">
                <Button
                  onClick={state === "running" ? stopTimer : startTimer}
                  variant={state === "running" ? "destructive" : "default"}
                  size="lg"
                  className="text-3xl py-8 h-auto bg-blue-600 hover:bg-blue-700"
                >
                  {state === "running" ? (
                    <>
                      <Pause className="w-8 h-8 mr-4" />
                      ストップ
                    </>
                  ) : (
                    <>
                      <Play className="w-8 h-8 mr-4" />
                      スタート
                    </>
                  )}
                </Button>

                <Button 
                  onClick={resetTimer} 
                  variant="outline" 
                  size="lg" 
                  className="text-3xl py-8 h-auto bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  <RotateCcw className="w-8 h-8 mr-4" />
                  リセット
                </Button>
              </div>

              <div className="bg-green-800/20 border-2 border-green-600 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-semibold text-green-400">操作端末</h3>
                </div>
                <p className="text-green-200">
                  この端末でタイマーを操作できます。他の端末は自動的に同期されます。
                </p>
              </div>
            </>
          ) : (
            <div className="bg-red-800/20 border-2 border-red-600 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Eye className="w-6 h-6 text-red-400" />
                <h3 className="text-xl font-semibold text-red-400">表示専用</h3>
              </div>
              <p className="text-red-200">
                この端末は表示専用です。操作は操作端末でのみ可能です。
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 表示画面（デフォルト）
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-black">サッカータイマー</h1>
          <div className="flex items-center gap-6">
            <Button
              onClick={() => setViewMode('control')}
              variant="outline"
              size="lg"
              className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
            >
              <Gamepad2 className="w-5 h-5 mr-2" />
              操作画面
            </Button>
            <div className="flex items-center gap-2">
              {isController ? (
                <>
                  <Settings className="w-6 h-6 text-blue-600" />
                  <span className="text-blue-600 font-medium">表示端末</span>
                </>
              ) : (
                <>
                  <Eye className="w-6 h-6 text-gray-600" />
                  <span className="text-gray-600 font-medium">表示専用</span>
                </>
              )}
            </div>
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
        </div>

        <div className="bg-white border-4 border-black rounded-lg p-12 mb-8">
          <div className="text-center">
            <div className="text-black text-[8rem] font-mono font-bold leading-none mb-4">
              {formatTime(currentTime)}
            </div>
            <div className="text-2xl text-gray-600 mb-8">
              状態: {state === "running" ? "実行中" : state === "paused" ? "一時停止" : "停止中"}
            </div>
            {!isController && (
              <div className="text-lg text-gray-600 mb-4">
                ※ 操作端末でのみタイマーを操作できます
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={state === "running" ? stopTimer : startTimer}
            variant={state === "running" ? "destructive" : "default"}
            size="lg"
            className="text-xl py-6"
            disabled={!isController}
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

          <Button 
            onClick={resetTimer} 
            variant="outline" 
            size="lg" 
            className="text-xl py-6 bg-transparent"
            disabled={!isController}
          >
            <RotateCcw className="w-6 h-6 mr-2" />
            リセット
          </Button>

          <Button 
            onClick={toggleFullscreen} 
            variant="outline" 
            size="lg" 
            className="text-xl py-6 bg-transparent"
          >
            <Maximize className="w-6 h-6 mr-2" />
            全画面
          </Button>
        </div>

        {!isController && (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">表示専用モード</h3>
            <p className="text-gray-700">
              このデバイスは表示専用モードです。タイマーの操作は操作端末でのみ可能です。
              タイマーの状態は自動的に同期され、すべての端末で同じ時刻が表示されます。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}