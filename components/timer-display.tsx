import { formatElapsed } from "@/lib/format-elapsed"

interface TimerDisplayProps {
  elapsed: number
  isFullscreen?: boolean
  isStreamingMode?: boolean
}

export function TimerDisplay({ elapsed, isFullscreen = false, isStreamingMode = false }: TimerDisplayProps) {
  const formattedTime = formatElapsed(elapsed, "soccer")

  if (isStreamingMode) {
    return (
      <div
        className="font-mono font-bold text-black text-6xl sm:text-7xl lg:text-8xl tracking-wider"
        aria-live="polite"
        aria-label={`Elapsed time: ${formattedTime}`}
      >
        {formattedTime}
      </div>
    )
  }

  return (
    <div
      className="font-mono font-bold rounded border-2 transition-all duration-300 text-4xl sm:text-6xl text-black bg-white px-3 py-2 sm:px-4 sm:py-2 border-gray-300"
      aria-live="polite"
      aria-label={`Elapsed time: ${formattedTime}`}
    >
      {formattedTime}
    </div>
  )
}
