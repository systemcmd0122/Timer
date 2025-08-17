"use client"

import { TimerProvider } from "@/contexts/timer-context"
import { TimerDisplay } from "@/components/timer-display"

export default function OverlayPage() {
  return (
    <TimerProvider>
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <TimerDisplay size="xl" className="text-green-400 drop-shadow-2xl" />
      </div>
    </TimerProvider>
  )
}
