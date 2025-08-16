export function formatElapsed(ms: number, mode: "soccer" | "standard" = "standard"): string {
  const safeMs = Math.max(0, ms)
  const totalSeconds = Math.floor(safeMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (mode === "soccer" && minutes >= 90) {
    const overtimeMinutes = minutes - 90
    const overtimeSeconds = seconds
    return `90+${overtimeMinutes.toString().padStart(2, "0")}:${overtimeSeconds.toString().padStart(2, "0")}`
  }

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}
