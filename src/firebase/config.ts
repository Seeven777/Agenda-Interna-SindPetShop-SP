import { initializeApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'dummy',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'dummy.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'dummy',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'dummy.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'dummy',
};

// Check if real config
if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  console.warn('🚧 Firebase DEV MODE (no .env.local) - Auth pode falhar mas app roda!');
}

let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase init error (expected in dev mode):', error);
  app = null;
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
export const messaging = app ? getMessaging(app) : null;
import { getMessaging } from 'firebase/messaging';
export default app || null;

