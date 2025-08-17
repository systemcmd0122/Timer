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

const saveToLocalStorage = (state: TimerState, key: string = LOCAL_STORAGE_KEY) => {
  try {
    localStorage.setItem(key, JSON.stringify(state))
    // ローカルモードでも他のタブに通知
    window.dispatchEvent(new CustomEvent(`timer-update-${key}`, { detail: state }))
  } catch (error) {
    console.error("Failed to save to localStorage:", error)
  }
}

const loadFromLocalStorage = (key: string = LOCAL_STORAGE_KEY): TimerState | null => {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error("Failed to load from localStorage:", error)
    return null
  }
}

export const saveTimerState = async (state: TimerState, sessionId?: string) => {
  const timerRef = sessionId ? `soccer-timer/${sessionId}` : TIMER_REF
  const localStorageKey = sessionId ? `${LOCAL_STORAGE_KEY}-${sessionId}` : LOCAL_STORAGE_KEY

  if (isFirebaseAvailable && database) {
    try {
      const writePromise = set(ref(database, timerRef), {
        ...state,
        lastUpdated: Date.now(),
      })

      // 即座にローカルストレージにも保存してローカル表示を更新
      saveToLocalStorage(state, localStorageKey)

      await writePromise
      console.log("[v0] Saved to Firebase successfully for session:", sessionId || "default")
    } catch (error) {
      console.error("Failed to save timer state to Firebase:", error)
      saveToLocalStorage(state, localStorageKey)
    }
  } else {
    saveToLocalStorage(state, localStorageKey)
  }
}

export const loadTimerState = async (sessionId?: string): Promise<TimerState | null> => {
  const timerRef = sessionId ? `soccer-timer/${sessionId}` : TIMER_REF
  const localStorageKey = sessionId ? `${LOCAL_STORAGE_KEY}-${sessionId}` : LOCAL_STORAGE_KEY

  if (isFirebaseAvailable && database) {
    try {
      return new Promise((resolve) => {
        const timerRefPath = ref(database, timerRef)
        onValue(
          timerRefPath,
          (snapshot) => {
            const data = snapshot.val()
            console.log("[v0] Loaded from Firebase for session:", sessionId || "default", data)
            resolve(data)
          },
          { onlyOnce: true },
        )
      })
    } catch (error) {
      console.error("Failed to load timer state from Firebase:", error)
      return loadFromLocalStorage(localStorageKey)
    }
  } else {
    return loadFromLocalStorage(localStorageKey)
  }
}

export const subscribeToTimerState = (callback: (state: TimerState | null) => void, sessionId?: string) => {
  const timerRef = sessionId ? `soccer-timer/${sessionId}` : TIMER_REF
  const localStorageKey = sessionId ? `${LOCAL_STORAGE_KEY}-${sessionId}` : LOCAL_STORAGE_KEY

  if (isFirebaseAvailable && database) {
    try {
      const timerRefPath = ref(database, timerRef)

      const unsubscribe = onValue(
        timerRefPath,
        (snapshot) => {
          const data = snapshot.val()
          if (data) {
            console.log("[v0] Firebase subscription update for session:", sessionId || "default", data)
            callback(data)
          }
        },
        (error) => {
          console.error("Firebase subscription error:", error)
          callback(null)
        },
      )

      return () => off(timerRefPath, "value", unsubscribe)
    } catch (error) {
      console.error("Failed to subscribe to Firebase:", error)
      return setupLocalSubscription(callback, localStorageKey)
    }
  } else {
    return setupLocalSubscription(callback, localStorageKey)
  }
}

const setupLocalSubscription = (callback: (state: TimerState | null) => void, key: string = LOCAL_STORAGE_KEY) => {
  const handleStorageChange = (event: CustomEvent<TimerState>) => {
    console.log("[v0] Local subscription update for key:", key, event.detail)
    callback(event.detail)
  }

  window.addEventListener(`timer-update-${key}`, handleStorageChange as EventListener)

  return () => {
    window.removeEventListener(`timer-update-${key}`, handleStorageChange as EventListener)
  }
}

export const clearTimerState = async (sessionId?: string) => {
  const timerRef = sessionId ? `soccer-timer/${sessionId}` : TIMER_REF
  const localStorageKey = sessionId ? `${LOCAL_STORAGE_KEY}-${sessionId}` : LOCAL_STORAGE_KEY

  if (isFirebaseAvailable && database) {
    try {
      await set(ref(database, timerRef), null)
    } catch (error) {
      console.error("Failed to clear timer state:", error)
    }
  }

  // ローカルストレージもクリア
  try {
    localStorage.removeItem(localStorageKey)
  } catch (error) {
    console.error("Failed to clear localStorage:", error)
  }
}

export const getFirebaseStatus = () => isFirebaseAvailable
