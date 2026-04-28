import * as admin from 'firebase-admin';
import { loadServiceAccount } from './service-account';

const sa = loadServiceAccount();

if (!admin.apps.length) {
  if (sa) {
    admin.initializeApp({
      credential: admin.credential.cert(sa as admin.ServiceAccount),
      storageBucket: 'dealflow-ai-651cb.appspot.com'
    });
  } else {
    // Fallback for environments without local JSON but with env vars
    admin.initializeApp();
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export default admin;
