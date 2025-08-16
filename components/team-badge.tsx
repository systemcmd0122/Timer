"use client"

import type React from "react"

import { useState } from "react"

interface TeamBadgeProps {
  teamName: string
  onTeamNameChange: (name: string) => void
  isFullscreen?: boolean
}

export function TeamBadge({ teamName, onTeamNameChange, isFullscreen = false }: TeamBadgeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState(teamName)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = tempName.trim().toUpperCase()
    if (trimmed.length >= 3 && trimmed.length <= 4) {
      onTeamNameChange(trimmed)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempName(teamName)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleCancel}
          className="w-12 sm:w-16 text-center font-bold border-2 rounded px-1 py-1 sm:px-2 transition-all duration-300 text-sm sm:text-lg bg-gray-200 border-gray-400"
          maxLength={4}
          autoFocus
        />
      </form>
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="font-bold px-2 py-1 sm:px-3 sm:py-2 rounded border-2 transition-all duration-300 text-sm sm:text-lg bg-gray-200 text-gray-700 border-gray-400 hover:bg-gray-300"
      aria-label={`Team name: ${teamName}. Click to edit.`}
    >
      {teamName}
    </button>
  )
}
