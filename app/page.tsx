'use client'

import { Suspense } from "react"
import { SoccerTimer } from "@/components/soccer-timer"

function SoccerTimerWrapper() {
  return <SoccerTimer />
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl font-mono font-bold text-black mb-4">00:00</div>
          <div className="text-xl text-gray-600">読み込み中...</div>
        </div>
      </div>
    }>
      <SoccerTimerWrapper />
    </Suspense>
  )
}