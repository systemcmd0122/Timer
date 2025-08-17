"use client"

import type React from "react"

import { useTimer } from "@/contexts/timer-context"
import { cn } from "@/lib/utils"

interface TimerDisplayProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ className, size = "lg" }) => {
  const { formattedTime } = useTimer()

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
    xl: "text-9xl md:text-[12rem] lg:text-[16rem]",
  }

  return (
    <div
      className={cn(
        "font-mono font-bold text-center select-none",
        "bg-white text-black",
        size === "xl" && "tracking-wider drop-shadow-lg",
        sizeClasses[size],
        className,
      )}
    >
      {formattedTime}
    </div>
  )
}
