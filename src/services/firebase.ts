import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: "AIzaSyA7HR8B7J_DKedpSOXDKzGCfJZDMKr_C8k",
  authDomain: "sb-pocket.firebaseapp.com",
  projectId: "sb-pocket",
  storageBucket: "sb-pocket.firebasestorage.app",
  messagingSenderId: "1029945706494",
  appId: "1:1029945706494:web:400d41cf946b72682da2af",
  measurementId: "G-08BJ1HX2N6",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Messaging: lazy init — só disponível em browsers com suporte a push
let _messaging: ReturnType<typeof getMessaging> | null = null;

export async function getFirebaseMessaging() {
  if (_messaging) return _messaging;
  try {
    if (!(await isSupported())) return null;
    _messaging = getMessaging(app);
    return _messaging;
  } catch {
    return null;
  }
}