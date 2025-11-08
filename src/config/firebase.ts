import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA6ZCGbEy0K8HHkUjyOztVONvMICiSn3wo",
  authDomain: "content-planer-7c7b8.firebaseapp.com",
  databaseURL: "https://content-planer-7c7b8-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "content-planer-7c7b8",
  storageBucket: "content-planer-7c7b8.firebasestorage.app",
  messagingSenderId: "936326714389",
  appId: "1:936326714389:web:e6848e41938ccf95e86a1c",
  measurementId: "G-GTL8BM0C1F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);

export default app;