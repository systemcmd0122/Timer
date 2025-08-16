import React, { memo } from "react"
import { formatElapsed } from "@/lib/format-elapsed"

interface TimerDisplayProps {
  elapsed: number
  isFullscreen?: boolean
  isStreamingMode?: boolean
}

const TimerDisplay = memo<TimerDisplayProps>(({ 
  elapsed, 
  isFullscreen = false, 
  isStreamingMode = false 
}) => {
  const formattedTime = formatElapsed(elapsed, "soccer")

  if (isStreamingMode) {
    return (
      <div
        className="font-mono font-bold text-black text-6xl sm:text-7xl lg:text-8xl tracking-wider will-change-contents"
        style={{ 
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          transform: 'translateZ(0)' // GPU加速
        }}
        aria-live="polite"
        aria-label={`Elapsed time: ${formattedTime}`}
        suppressHydrationWarning={true}
      >
        {formattedTime}
      </div>
    )
  }

  return (
    <div
      className="font-mono font-bold rounded border-2 transition-all duration-300 text-4xl sm:text-6xl text-black bg-white px-3 py-2 sm:px-4 sm:py-2 border-gray-300 will-change-contents"
      style={{ 
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
        transform: 'translateZ(0)' // GPU加速
      }}
      aria-live="polite"
      aria-label={`Elapsed time: ${formattedTime}`}
      suppressHydrationWarning={true}
    >
      {formattedTime}
    </div>
  )
})

TimerDisplay.displayName = 'TimerDisplay'

export { TimerDisplay }