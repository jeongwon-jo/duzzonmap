// src/firebase/config.js
// Firebase 설정 파일 - 실제 사용 시 본인의 Firebase 프로젝트 설정값으로 교체하세요

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBtxNODu2wdNGUvaE4snooNWzlNxfbhPOU",
  authDomain: "duzzonmap.firebaseapp.com",
  projectId: "duzzonmap",
  storageBucket: "duzzonmap.firebasestorage.app",
  messagingSenderId: "1025083653509",
  appId: "1:1025083653509:web:e27cfbc723234b483c98ec",
  measurementId: "G-C6YZD8PLVQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
