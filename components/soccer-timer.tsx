"use client"

import { useSoccerTimer } from "@/hooks/use-soccer-timer"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Maximize, Wifi, WifiOff, Settings, Eye, Monitor, Gamepad2, Menu, X, Minimize } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from 'next/navigation'

export function SoccerTimer() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const {
    currentTime,
    state,
    isConnected,
    isController,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime,
  } = useSoccerTimer()

  const [viewMode, setViewMode] = useState<'display' | 'control'>('display')
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // URLパラメータからフルスクリーン状態を取得
  useEffect(() => {
    const fullscreenParam = searchParams.get('fullscreen')
    setIsFullscreen(fullscreenParam === 'true')
  }, [searchParams])

  // モバイル判定
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // スマートフォンでのタッチイベント最適化
  useEffect(() => {
    if (isMobile) {
      // ダブルタップズーム無効化
      document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
          e.preventDefault()
        }
      })
      
      // ピンチズーム無効化
      document.addEventListener('gesturestart', (e) => {
        e.preventDefault()
      })
    }
  }, [isMobile])

  // フルスクリーン状態の監視
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement
      
      // ブラウザのフルスクリーン状態とURL状態を同期
      if (!isCurrentlyFullscreen && isFullscreen) {
        // フルスクリーンが終了したらURLも更新
        const currentParams = new URLSearchParams(searchParams.toString())
        currentParams.delete('fullscreen')
        router.push(`?${currentParams.toString()}`, { scroll: false })
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [isFullscreen, router, searchParams])

  // ESCキーでフルスクリーン終了の処理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        exitFullscreen()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen])

  const enterFullscreen = async () => {
    try {
      const element = document.documentElement
      
      // URLにフルスクリーンパラメータを追加
      const currentParams = new URLSearchParams(searchParams.toString())
      currentParams.set('fullscreen', 'true')
      router.push(`?${currentParams.toString()}`, { scroll: false })
      
      // ブラウザのフルスクリーンAPI実行
      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen()
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen()
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen()
      }
    } catch (error) {
      console.error("フルスクリーン開始エラー:", error)
      // エラーの場合はURLパラメータを削除
      const currentParams = new URLSearchParams(searchParams.toString())
      currentParams.delete('fullscreen')
      router.push(`?${currentParams.toString()}`, { scroll: false })
    }
  }

  const exitFullscreen = async () => {
    try {
      // URLからフルスクリーンパラメータを削除
      const currentParams = new URLSearchParams(searchParams.toString())
      currentParams.delete('fullscreen')
      router.push(`?${currentParams.toString()}`, { scroll: false })
      
      // ブラウザのフルスクリーン終了
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen()
      }
    } catch (error) {
      console.error("フルスクリーン終了エラー:", error)
    }
  }

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }

  // フルスクリーン表示モード
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center px-4 relative w-full h-full flex items-center justify-center">
          {/* フルスクリーン終了ボタン */}
          <Button
            onClick={exitFullscreen}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 bg-black/10 hover:bg-black/20 text-black"
          >
            <Minimize className="w-6 h-6" />
          </Button>
          
          <div className={`text-black font-mono font-bold leading-none ${
            isMobile ? 'text-[8rem] sm:text-[12rem]' : 'text-[20rem]'
          }`}>
            {formatTime(currentTime)}
          </div>
          
          {/* フルスクリーン用コントロール（モバイルのみ、コントローラーの場合） */}
          {isMobile && isController && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
              <Button
                onClick={state === "running" ? stopTimer : startTimer}
                variant={state === "running" ? "destructive" : "default"}
                size="lg"
                className="w-20 h-20 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
              >
                {state === "running" ? (
                  <Pause className="w-10 h-10 text-white" />
                ) : (
                  <Play className="w-10 h-10 text-white" />
                )}
              </Button>

              <Button 
                onClick={resetTimer} 
                variant="outline"
                size="lg" 
                className="w-20 h-20 rounded-full shadow-lg bg-white border-4 border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
              >
                <RotateCcw className="w-8 h-8 text-gray-700" />
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // モバイル用メニューコンポーネント
  const MobileMenu = () => (
    <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
      showMobileMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform ${
        showMobileMenu ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">メニュー</h3>
            <Button
              onClick={() => setShowMobileMenu(false)}
              variant="ghost"
              size="sm"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={() => {
                setViewMode(viewMode === 'display' ? 'control' : 'display')
                setShowMobileMenu(false)
              }}
              className="w-full justify-start"
              variant="outline"
            >
              {viewMode === 'display' ? (
                <>
                  <Gamepad2 className="w-5 h-5 mr-3" />
                  操作画面
                </>
              ) : (
                <>
                  <Monitor className="w-5 h-5 mr-3" />
                  表示画面
                </>
              )}
            </Button>
            
            <Button
              onClick={() => {
                toggleFullscreen()
                setShowMobileMenu(false)
              }}
              className="w-full justify-start"
              variant="outline"
            >
              <Maximize className="w-5 h-5 mr-3" />
              全画面
            </Button>
          </div>
          
          <div className="mt-8 pt-6 border-t">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {isController ? (
                  <>
                    <Settings className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-600 font-medium">操作端末</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-600 font-medium">表示専用</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">接続中</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-red-600" />
                    <span className="text-red-600 font-medium">切断</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // 操作専用画面（モバイル対応）
  if (viewMode === 'control') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {isMobile && <MobileMenu />}
        
        <div className="p-4 sm:p-8">
          <div className="max-w-2xl mx-auto">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl sm:text-4xl font-bold">タイマー操作</h1>
              {isMobile ? (
                <Button
                  onClick={() => setShowMobileMenu(true)}
                  variant="ghost"
                  size="sm"
                  className="text-white"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              ) : (
                <div className="flex items-center gap-6">
                  <Button
                    onClick={() => setViewMode('display')}
                    variant="outline"
                    size="lg"
                    className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                  >
                    <Monitor className="w-5 h-5 mr-2" />
                    表示画面
                  </Button>
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <>
                        <Wifi className="w-6 h-6 text-green-400" />
                        <span className="text-green-400 font-medium">接続中</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-6 h-6 text-red-400" />
                        <span className="text-red-400 font-medium">切断</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* タイマー表示 */}
            <div className="bg-gray-800 rounded-lg p-6 sm:p-8 mb-6 sm:mb-8">
              <div className="text-center">
                <div className="text-green-400 text-5xl sm:text-6xl md:text-[8rem] font-mono font-bold leading-none mb-4 sm:mb-6">
                  {formatTime(currentTime)}
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-4 sm:mb-8">
                  {state === "running" ? "⏱️ 実行中" : state === "paused" ? "⏸️ 一時停止" : "⏹️ 停止中"}
                </div>
              </div>
            </div>

            {/* 操作ボタン */}
            {isController ? (
              <>
                <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                  <Button
                    onClick={state === "running" ? stopTimer : startTimer}
                    variant={state === "running" ? "destructive" : "default"}
                    className="w-full text-2xl sm:text-3xl py-6 sm:py-8 h-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
                    style={{ minHeight: '80px' }}
                  >
                    {state === "running" ? (
                      <>
                        <Pause className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4" />
                        ストップ
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4" />
                        スタート
                      </>
                    )}
                  </Button>

                  <Button 
                    onClick={resetTimer} 
                    className="w-full text-2xl sm:text-3xl py-6 sm:py-8 h-auto bg-gray-700 border-gray-600 text-white hover:bg-gray-600 active:bg-gray-500 transition-colors touch-manipulation"
                    style={{ minHeight: '80px' }}
                  >
                    <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4" />
                    リセット
                  </Button>

                  <Button 
                    onClick={toggleFullscreen} 
                    className="w-full text-2xl sm:text-3xl py-6 sm:py-8 h-auto bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-colors touch-manipulation"
                    style={{ minHeight: '80px' }}
                  >
                    <Maximize className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4" />
                    全画面表示
                  </Button>
                </div>

                <div className="bg-green-800/20 border-2 border-green-600 rounded-lg p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                    <h3 className="text-lg sm:text-xl font-semibold text-green-400">操作端末</h3>
                  </div>
                  <p className="text-sm sm:text-base text-green-200">
                    この端末でタイマーを操作できます。他の端末は自動的に同期されます。
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-red-800/20 border-2 border-red-600 rounded-lg p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                  <h3 className="text-lg sm:text-xl font-semibold text-red-400">表示専用</h3>
                </div>
                <p className="text-sm sm:text-base text-red-200">
                  この端末は表示専用です。操作は操作端末でのみ可能です。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 表示画面（デフォルト・モバイル対応）
  return (
    <div className="min-h-screen bg-white">
      {isMobile && <MobileMenu />}
      
      <div className="p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">サッカータイマー</h1>
            {isMobile ? (
              <Button
                onClick={() => setShowMobileMenu(true)}
                variant="ghost"
                size="sm"
              >
                <Menu className="w-6 h-6" />
              </Button>
            ) : (
              <div className="flex items-center gap-4 lg:gap-6">
                <Button
                  onClick={() => setViewMode('control')}
                  variant="outline"
                  size="lg"
                  className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                >
                  <Gamepad2 className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                  操作画面
                </Button>
                <div className="flex items-center gap-2">
                  {isController ? (
                    <>
                      <Settings className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                      <span className="hidden lg:inline text-blue-600 font-medium">操作端末</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
                      <span className="hidden lg:inline text-gray-600 font-medium">表示専用</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <>
                      <Wifi className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                      <span className="hidden lg:inline text-green-600 font-medium">Firebase同期中</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
                      <span className="hidden lg:inline text-red-600 font-medium">接続中...</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* タイマー表示 */}
          <div className="bg-white border-2 sm:border-4 border-black rounded-lg p-6 sm:p-8 md:p-12 mb-6 sm:mb-8">
            <div className="text-center">
              <div className="text-black text-4xl sm:text-6xl md:text-7xl lg:text-[8rem] font-mono font-bold leading-none mb-2 sm:mb-4">
                {formatTime(currentTime)}
              </div>
              <div className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-4 sm:mb-6 md:mb-8">
                状態: {state === "running" ? "実行中" : state === "paused" ? "一時停止" : "停止中"}
              </div>
              {!isController && (
                <div className="text-sm sm:text-base md:text-lg text-gray-600 mb-2 sm:mb-4">
                  ※ 操作端末でのみタイマーを操作できます
                </div>
              )}
            </div>
          </div>

          {/* 操作ボタン（デスクトップのみ） */}
          {!isMobile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Button
                onClick={state === "running" ? stopTimer : startTimer}
                variant={state === "running" ? "destructive" : "default"}
                size="lg"
                className="text-xl py-6"
                disabled={!isController}
              >
                {state === "running" ? (
                  <>
                    <Pause className="w-6 h-6 mr-2" />
                    ストップ
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-2" />
                    スタート
                  </>
                )}
              </Button>

              <Button 
                onClick={resetTimer} 
                variant="outline" 
                size="lg" 
                className="text-xl py-6 bg-transparent"
                disabled={!isController}
              >
                <RotateCcw className="w-6 h-6 mr-2" />
                リセット
              </Button>

              <Button 
                onClick={toggleFullscreen} 
                variant="outline" 
                size="lg" 
                className="text-xl py-6 bg-transparent"
              >
                <Maximize className="w-6 h-6 mr-2" />
                全画面
              </Button>
            </div>
          )}

          {/* モバイル用フローティングアクションボタン */}
          {isMobile && isController && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-30">
              <Button
                onClick={state === "running" ? stopTimer : startTimer}
                variant={state === "running" ? "destructive" : "default"}
                size="lg"
                className="w-16 h-16 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
              >
                {state === "running" ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8" />
                )}
              </Button>

              <Button 
                onClick={resetTimer} 
                variant="outline"
                size="lg" 
                className="w-16 h-16 rounded-full shadow-lg bg-white border-2 border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
              >
                <RotateCcw className="w-6 h-6 text-gray-700" />
              </Button>
            </div>
          )}

          {/* 情報表示 */}
          {!isController && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">表示専用モード</h3>
              <p className="text-sm sm:text-base text-gray-700">
                このデバイスは表示専用モードです。タイマーの操作は操作端末でのみ可能です。
                タイマーの状態は自動的に同期され、すべての端末で同じ時刻が表示されます。
                フルスクリーン表示にするとURLに?fullscreen=trueパラメータが追加され、
                直接このURLにアクセスすることでフルスクリーン表示を開始できます。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}