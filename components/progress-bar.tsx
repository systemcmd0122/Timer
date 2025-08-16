import React, { memo, useMemo } from "react"

interface ProgressBarProps {
  elapsed: number
  isFullscreen?: boolean
}

const ProgressBar = memo<ProgressBarProps>(({ elapsed, isFullscreen = false }) => {
  const progressData = useMemo(() => {
    const minutes = elapsed / (60 * 1000)
    const progress = Math.min(Math.max(minutes / 90, 0), 1) * 100
    return {
      progress,
      progressFormatted: Math.round(progress)
    }
  }, [elapsed])

  return (
    <div className="w-full mt-3 sm:mt-4">
      <div className="w-full rounded-full h-2 sm:h-3 bg-gray-200 overflow-hidden">
        <div
          className="h-2 sm:h-3 rounded-full transition-all duration-150 ease-out bg-green-500 will-change-transform"
          style={{ 
            width: `${progressData.progress}%`,
            transform: 'translateZ(0)' // GPU加速
          }}
          aria-label={`Match progress: ${progressData.progressFormatted}%`}
        />
      </div>
      <div className="flex justify-between text-xs mt-1 text-gray-600">
        <span>0</span>
        <span>45</span>
        <span>90</span>
      </div>
    </div>
  )
})

ProgressBar.displayName = 'ProgressBar'

export { ProgressBar }