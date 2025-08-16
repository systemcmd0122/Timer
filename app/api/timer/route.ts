import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory store for timer state
const timerState = {
  elapsed: 0,
  isRunning: false,
  lastUpdate: Date.now(),
  sessionId: Math.random().toString(36).substring(7),
}

export async function GET() {
  return NextResponse.json(timerState)
}

export async function POST(request: NextRequest) {
  const { action, elapsed } = await request.json()

  switch (action) {
    case "start":
      timerState.isRunning = true
      timerState.lastUpdate = Date.now()
      break
    case "pause":
      if (timerState.isRunning) {
        timerState.elapsed = timerState.elapsed + (Date.now() - timerState.lastUpdate)
        timerState.isRunning = false
      }
      break
    case "reset":
      timerState.elapsed = 0
      timerState.isRunning = false
      timerState.lastUpdate = Date.now()
      break
    case "sync":
      if (elapsed !== undefined) {
        timerState.elapsed = elapsed
        timerState.lastUpdate = Date.now()
      }
      break
  }

  return NextResponse.json(timerState)
}
