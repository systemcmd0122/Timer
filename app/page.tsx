"use client"

import { TimerProvider } from "@/contexts/timer-context"
import { TimerDisplay } from "@/components/timer-display"
import { TimerControls } from "@/components/timer-controls"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <TimerProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-green-700">⚽ サッカーストップウォッチ</CardTitle>
              <p className="text-sm text-muted-foreground">Firebase Realtime Database で即座に同期</p>
            </CardHeader>

            <CardContent className="space-y-8">
              <div className="bg-gray-900 rounded-lg p-8">
                <TimerDisplay className="text-green-400" />
              </div>

              <TimerControls />

              <div className="flex gap-4 justify-center">
                <Link href="/display">
                  <Button variant="outline" className="bg-black text-green-400 hover:bg-gray-800">
                    📺 表示用ページ
                  </Button>
                </Link>
                <Link href="/remote">
                  <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700">
                    🎮 リモート操作
                  </Button>
                </Link>
              </div>

              <div className="text-center text-sm text-muted-foreground space-y-2">
                <p>💡 使い方:</p>
                <p>• 表示用ページ - 配信用の大きな表示</p>
                <p>• リモート操作ページ - 別端末からの操作用</p>
                <p>• リモートモードをONにして複数端末で同期</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TimerProvider>
  )
}
