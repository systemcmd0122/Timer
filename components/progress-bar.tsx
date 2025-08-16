interface ProgressBarProps {
  elapsed: number
  isFullscreen?: boolean
}

export function ProgressBar({ elapsed, isFullscreen = false }: ProgressBarProps) {
  const minutes = elapsed / (60 * 1000)
  const progress = Math.min(minutes / 90, 1) * 100

  return (
    <div className="w-full mt-3 sm:mt-4">
      <div className="w-full rounded-full h-2 sm:h-3 bg-gray-200">
        <div
          className="h-2 sm:h-3 rounded-full transition-all duration-300 ease-out bg-green-500"
          style={{ width: `${progress}%` }}
          aria-label={`Match progress: ${Math.round(progress)}%`}
        />
      </div>
      <div className="flex justify-between text-xs mt-1 text-gray-600">
        <span>0</span>
        <span>45</span>
        <span>90</span>
      </div>
    </div>
  )
}
