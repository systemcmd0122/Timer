// 高精度時間フォーマット関数（ミリ秒単位での正確な計算）
export function formatElapsed(ms: number, mode: "soccer" | "standard" = "standard"): string {
  // 負の値を防ぐ
  const safeMs = Math.max(0, ms)
  
  // より正確な計算のためMath.floorを使用
  const totalSeconds = Math.floor(safeMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  // サッカーモードでの延長時間表示
  if (mode === "soccer" && minutes >= 90) {
    const overtimeMinutes = minutes - 90
    const overtimeSeconds = seconds
    return `90+${overtimeMinutes.toString().padStart(2, "0")}:${overtimeSeconds.toString().padStart(2, "0")}`
  }

  // 標準的な分:秒フォーマット
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

// デバッグ用の詳細フォーマット関数
export function formatElapsedDetailed(ms: number): string {
  const safeMs = Math.max(0, ms)
  const totalSeconds = Math.floor(safeMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const milliseconds = Math.floor(safeMs % 1000)
  
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`
}