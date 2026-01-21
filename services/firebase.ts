import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBaGsJzmhdXpUmrIo4q4d74u6ZCo8-ttuk",
  authDomain: "ecofreight-70197.firebaseapp.com",
  projectId: "ecofreight-70197",
  storageBucket: "ecofreight-70197.firebasestorage.app",
  messagingSenderId: "832216975138",
  appId: "1:832216975138:web:2de866c2029151a5af077b"
};

// Uygulamanın zaten başlatılıp başlatılmadığını kontrol et (HMR güvenliği için)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Auth servisini başlat ve dışa aktar
export const auth = getAuth(app);

export { signInWithEmailAndPassword, signOut, onAuthStateChanged };