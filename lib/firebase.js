import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, indexedDBLocalPersistence, browserLocalPersistence } from "firebase/auth";
import { initializeFirestore, getFirestore, persistentLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  // IndexedDB survives PWA/browser restarts more reliably than the default local storage persistence
  setPersistence(auth, indexedDBLocalPersistence).catch(() => setPersistence(auth, browserLocalPersistence).catch(() => {}));
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache(),
    });
  } catch (error) {
    console.warn('Persistent Firestore cache unavailable, using default cache:', error);
    db = getFirestore(app);
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { app, auth, db };
