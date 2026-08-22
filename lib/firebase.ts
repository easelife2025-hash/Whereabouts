import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getFunctions } from 'firebase/functions';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBpxYmNz83ngBUAB-9M98XUuiCSLWnS950",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "location-share-6d807.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "location-share-6d807",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "location-share-6d807.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "382155482514",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:382155482514:web:f7118034c7b1602464cd4b",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://location-share-6d807-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const functions = getFunctions(app);

// Initialize messaging only in the browser and if supported
export const getFirebaseMessaging = async () => {
  if (typeof window !== 'undefined') {
    const supported = await isSupported();
    if (supported) {
      return getMessaging(app);
    }
  }
  return null;
};
