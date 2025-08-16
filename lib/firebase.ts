import { initializeApp } from "firebase/app"
import { getDatabase, connectDatabaseEmulator } from "firebase/database"

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

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig)

// Realtime Databaseを取得
export const database = getDatabase(app)

// 開発環境でエミュレータを使用する場合（オプション）
// if (process.env.NODE_ENV === 'development') {
//   connectDatabaseEmulator(database, 'localhost', 9000)
// }