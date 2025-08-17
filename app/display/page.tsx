"use client"

import { TimerProvider, useTimer } from "@/contexts/timer-context"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

function DisplayContent() {
  const { formattedTime, setSessionId } = useTimer()
  const searchParams = useSearchParams()

  useEffect(() => {
    const sessionId = searchParams.get("id")
    if (sessionId) {
      setSessionId(sessionId)
    }
  }, [searchParams, setSessionId])

  return (
    <div className="h-screen w-screen bg-white flex items-center justify-center overflow-hidden">
      <div className="text-center">
        <div className="text-[20rem] md:text-[25rem] lg:text-[30rem] font-mono font-bold text-black leading-none tracking-wider">
          {formattedTime}
        </div>
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
