"use client"

import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Plus, Minus } from "lucide-react"

interface ControlsProps {
  isRunning: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onAddMinute: () => void
  onSubtractMinute: () => void
  onJumpTo45: () => void
  onJumpTo90: () => void
  isFullscreen?: boolean
  isRemoteMode?: boolean
}

export function Controls({
  isRunning,
  onStart,
  onPause,
  onReset,
  onAddMinute,
  onSubtractMinute,
  onJumpTo45,
  onJumpTo90,
  isFullscreen = false,
  isRemoteMode = false,
}: ControlsProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Primary Controls */}
      <div className="flex gap-2 sm:gap-3">
        <Button
          onClick={isRunning ? onPause : onStart}
          size="lg"
          className="flex-1 h-12 sm:h-14 lg:h-16 text-base sm:text-lg transition-all duration-300"
          variant={isRunning ? "destructive" : "default"}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Start
            </>
          )}
        </Button>

        <Button
          onClick={onReset}
          size="lg"
          variant="outline"
          className="h-12 sm:h-14 lg:h-16 px-4 sm:px-6 bg-transparent"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>

      {!isRemoteMode && (
        <>
          {/* Time Adjustment Controls */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button
              onClick={onSubtractMinute}
              variant="outline"
              size="lg"
              className="h-10 sm:h-12 text-sm sm:text-base bg-transparent"
            >
              <Minus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />1 min
            </Button>

            <Button
              onClick={onAddMinute}
              variant="outline"
              size="lg"
              className="h-10 sm:h-12 text-sm sm:text-base bg-transparent"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />1 min
            </Button>
          </div>

          {/* Jump Controls */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button onClick={onJumpTo45} variant="secondary" size="lg" className="h-10 sm:h-12 text-xs sm:text-sm">
              Jump to 45:00
            </Button>

            <Button onClick={onJumpTo90} variant="secondary" size="lg" className="h-10 sm:h-12 text-xs sm:text-sm">
              Jump to 90:00
            </Button>
          </div>
        </>
      )}
    </div>
  )
}