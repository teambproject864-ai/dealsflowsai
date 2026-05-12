import { initializeApp, getApps } from 'firebase/app'; 
import { getFirestore } from 'firebase/firestore'; 
import { getStorage } from 'firebase/storage';

const firebaseConfig = { 
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(), 
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(), 
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(), 
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(), 
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() 
};

// Debug log for configuration
if (typeof window !== 'undefined') {
  console.log('Firebase Config Check:', {
    hasApiKey: !!firebaseConfig.apiKey,
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId?.split(':').slice(0, 2).join(':') + ':...' // obfuscated
  });
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app); 
export const storage = getStorage(app); 
export default app; 
