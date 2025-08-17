"use client"

import { TimerProvider, useTimer } from "@/contexts/timer-context"
import { TimerDisplay } from "@/components/timer-display"
import { TimerControls } from "@/components/timer-controls"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

function RemoteContent() {
  const { setSessionId, sessionId } = useTimer()
  const searchParams = useSearchParams()

  useEffect(() => {
    const urlSessionId = searchParams.get("id")
    if (urlSessionId) {
      setSessionId(urlSessionId)
    }
  }, [searchParams, setSessionId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-lg mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-700">🎮 リモートコントロール</CardTitle>
            <p className="text-sm text-muted-foreground">他の端末のタイマーを操作できます</p>
            {sessionId && (
              <div className="mt-2 px-3 py-1 bg-blue-100 rounded-full text-xs font-medium text-blue-800">
                セッション: {sessionId}
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6">
              <TimerDisplay size="md" className="text-green-400" />
            </div>

            <TimerControls />

            <div className="text-center text-xs text-muted-foreground">Firebase Realtime Database で即座に同期</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function RemotePage() {
  return (
    <TimerProvider>
      <RemoteContent />
    </TimerProvider>
  )
}
