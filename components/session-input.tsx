"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SessionInputProps {
  onSessionSet: (sessionId: string) => void
  currentSessionId?: string | null
}

export const SessionInput: React.FC<SessionInputProps> = ({ onSessionSet, currentSessionId }) => {
  const [inputId, setInputId] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputId.trim()) {
      onSessionSet(inputId.trim())
    }
  }

  const generateRandomId = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase()
    setInputId(randomId)
  }

  if (currentSessionId) {
    return (
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium text-green-800">接続中のセッション</Label>
            <p className="text-lg font-bold text-green-900">{currentSessionId}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => onSessionSet("")}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            切断
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="session-id" className="text-sm font-medium text-blue-800">
            セッションIDを入力
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="session-id"
              type="text"
              value={inputId}
              onChange={(e) => setInputId(e.target.value.toUpperCase())}
              placeholder="例: ABC123"
              className="flex-1"
              maxLength={10}
            />
            <Button type="button" variant="outline" onClick={generateRandomId}>
              ランダム生成
            </Button>
          </div>
        </div>
        <Button type="submit" disabled={!inputId.trim()} className="w-full">
          セッションに接続
        </Button>
      </form>
    </div>
  )
}
