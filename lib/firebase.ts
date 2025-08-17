import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"

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

const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)
