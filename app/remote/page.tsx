"use client"

import { TimerProvider } from "@/contexts/timer-context"
import { TimerDisplay } from "@/components/timer-display"
import { TimerControls } from "@/components/timer-controls"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RemotePage() {
  return (
    <TimerProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="max-w-lg mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-blue-700">🎮 リモートコントロール</CardTitle>
              <p className="text-sm text-muted-foreground">他の端末のタイマーを操作できます</p>
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
    </TimerProvider>
  )
}
