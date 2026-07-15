import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAYBNUqEiytgz32uykU4Csh0ymdkEV12VE",
  authDomain: "xiuyijing-hanxiiu.firebaseapp.com",
  projectId: "xiuyijing-hanxiiu",
  storageBucket: "xiuyijing-hanxiiu.firebasestorage.app",
  messagingSenderId: "58751884687",
  appId: "1:58751884687:web:37d1fa3fa8141e71363ffa"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
