"use client"

import type React from "react"

import { useTimer } from "@/contexts/timer-context"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Play, Pause, RotateCcw, Plus, Minus, ExternalLink, Gamepad2 } from "lucide-react"

export const TimerControls: React.FC = () => {
  const { isRunning, remoteMode, startTimer, stopTimer, resetTimer, toggleRemoteMode, addMinute, subtractMinute } =
    useTimer()

  const openOverlay = () => {
    window.open(`${window.location.origin}?overlay=true`, "_blank", "fullscreen=yes")
  }

  const openRemote = () => {
    window.open(`${window.location.origin}?remote=true`, "_blank")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center space-x-2">
        <Label htmlFor="remote-mode" className="text-sm font-medium">
          リモートモード
        </Label>
        <Switch id="remote-mode" checked={remoteMode} onCheckedChange={toggleRemoteMode} />
        {remoteMode && <span className="text-xs text-green-600 font-medium">ON</span>}
      </div>

      <div className="flex gap-2 justify-center">
        <Button onClick={subtractMinute} size="sm" variant="outline" className="min-w-16 bg-transparent">
          <Minus className="w-4 h-4 mr-1" />
          1分
        </Button>
        <Button onClick={addMinute} size="sm" variant="outline" className="min-w-16 bg-transparent">
          <Plus className="w-4 h-4 mr-1" />
          1分
        </Button>
      </div>

      {/* 既存のタイマーコントロール */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={isRunning ? stopTimer : startTimer}
          size="lg"
          variant={isRunning ? "destructive" : "default"}
          className="min-w-24"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              停止
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              開始
            </>
          )}
        </Button>

        <Button onClick={resetTimer} size="lg" variant="outline" className="min-w-24 bg-transparent">
          <RotateCcw className="w-5 h-5 mr-2" />
          リセット
        </Button>
      </div>

      <div className="flex gap-3 justify-center">
        <Button onClick={openOverlay} size="sm" variant="secondary" className="min-w-32">
          <ExternalLink className="w-4 h-4 mr-2" />
          オーバーレイ表示
        </Button>
        <Button onClick={openRemote} size="sm" variant="secondary" className="min-w-32">
          <Gamepad2 className="w-4 h-4 mr-2" />
          リモート操作
        </Button>
      </div>
    </div>
  )
}
