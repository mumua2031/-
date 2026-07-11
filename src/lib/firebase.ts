import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "gen-lang-client-0446963755",
  appId: "1:788751021934:web:6e315f88479bb85c23b37f",
  apiKey: "AIzaSyDzJbsuFe1H91jAL4mDTvWoMdcguCvYqY0",
  authDomain: "gen-lang-client-0446963755.firebaseapp.com",
  storageBucket: "gen-lang-client-0446963755.firebasestorage.app",
  messagingSenderId: "788751021934",
  measurementId: ""
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app, "ai-studio-c15e0efa-10a9-4c13-960f-65e19b9286a6");
export const auth = getAuth(app);
