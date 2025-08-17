"use client"

import { TimerProvider, useTimer } from "@/contexts/timer-context"

function DisplayContent() {
  const { formattedTime } = useTimer()

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-[12rem] md:text-[16rem] font-mono font-bold text-green-400 leading-none tracking-wider">
          {formattedTime}
        </div>
        <div className="text-2xl text-green-300 mt-4 font-medium">サッカータイマー</div>
      </div>
    </div>
  )
}

export default function DisplayPage() {
  return (
    <TimerProvider>
      <DisplayContent />
    </TimerProvider>
  )
}
