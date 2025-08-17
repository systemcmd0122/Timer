import { initializeApp } from "firebase/app"
import { getDatabase, ref, set, onValue, off } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyCUP4ghalS-zHGHglgN0sgQcO5mAitEBZQ",
  authDomain: "tetris-62a89.firebaseapp.com",
  databaseURL: "https://tetris-62a89-default-rtdb.firebaseio.com",
  projectId: "tetris-62a89",
  storageBucket: "tetris-62a89.firebasestorage.app",
  messagingSenderId: "500670895710",
  appId: "1:500670895710:web:ceeb6ade2af679dde786cf",
  measurementId: "G-GYWCGHT4BT",
}

export interface TimerState {
  isRunning: boolean
  startTime: number | null
  elapsedTime: number
  lastUpdated: number
  remoteMode: boolean
}

let app: any = null
let database: any = null
let isFirebaseAvailable = false

try {
  app = initializeApp(firebaseConfig)
  database = getDatabase(app)
  isFirebaseAvailable = true
  console.log("[v0] Firebase initialized successfully")
} catch (error) {
  console.warn("[v0] Firebase initialization failed, using local storage fallback:", error)
  isFirebaseAvailable = false
}

const TIMER_REF = "soccer-timer"
const LOCAL_STORAGE_KEY = "soccer-timer-state"

const saveToLocalStorage = (state: TimerState) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state))
    // ローカルモードでも他のタブに通知
    window.dispatchEvent(new CustomEvent("timer-update", { detail: state }))
  } catch (error) {
    console.error("Failed to save to localStorage:", error)
  }
}

const loadFromLocalStorage = (): TimerState | null => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error("Failed to load from localStorage:", error)
    return null
  }
}

export const saveTimerState = async (state: TimerState) => {
  if (isFirebaseAvailable && database) {
    try {
      await set(ref(database, TIMER_REF), {
        ...state,
        lastUpdated: Date.now(),
      })
      console.log("[v0] Saved to Firebase successfully")
    } catch (error) {
      console.error("Failed to save timer state to Firebase:", error)
      // Firebase失敗時はローカルストレージにフォールバック
      saveToLocalStorage(state)
    }
  } else {
    // Firebase利用不可時はローカルストレージを使用
    saveToLocalStorage(state)
  }
}

export const loadTimerState = async (): Promise<TimerState | null> => {
  if (isFirebaseAvailable && database) {
    try {
      return new Promise((resolve) => {
        const timerRef = ref(database, TIMER_REF)
        onValue(
          timerRef,
          (snapshot) => {
            const data = snapshot.val()
            console.log("[v0] Loaded from Firebase:", data)
            resolve(data)
          },
          { onlyOnce: true },
        )
      })
    } catch (error) {
      console.error("Failed to load timer state from Firebase:", error)
      return loadFromLocalStorage()
    }
  } else {
    // Firebase利用不可時はローカルストレージから読み込み
    return loadFromLocalStorage()
  }
}

export const subscribeToTimerState = (callback: (state: TimerState | null) => void) => {
  if (isFirebaseAvailable && database) {
    try {
      const timerRef = ref(database, TIMER_REF)

      const unsubscribe = onValue(
        timerRef,
        (snapshot) => {
          const data = snapshot.val()
          console.log("[v0] Firebase subscription update:", data)
          callback(data)
        },
        (error) => {
          console.error("Firebase subscription error:", error)
          callback(null)
        },
      )

      return () => off(timerRef, "value", unsubscribe)
    } catch (error) {
      console.error("Failed to subscribe to Firebase:", error)
      // Firebase失敗時はローカルイベントリスナーを使用
      return setupLocalSubscription(callback)
    }
  } else {
    // Firebase利用不可時はローカルイベントリスナーを使用
    return setupLocalSubscription(callback)
  }
}

const setupLocalSubscription = (callback: (state: TimerState | null) => void) => {
  const handleStorageChange = (event: CustomEvent<TimerState>) => {
    console.log("[v0] Local subscription update:", event.detail)
    callback(event.detail)
  }

  window.addEventListener("timer-update", handleStorageChange as EventListener)

  return () => {
    window.removeEventListener("timer-update", handleStorageChange as EventListener)
  }
}

export const clearTimerState = async () => {
  if (isFirebaseAvailable && database) {
    try {
      await set(ref(database, TIMER_REF), null)
    } catch (error) {
      console.error("Failed to clear timer state:", error)
    }
  }

  // ローカルストレージもクリア
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear localStorage:", error)
  }
}

export const getFirebaseStatus = () => isFirebaseAvailable
