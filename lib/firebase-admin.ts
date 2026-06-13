import * as admin from "firebase-admin";
import { loadServiceAccount } from "./service-account";
import { validateEnv } from "./env-validator";

const ADMIN_APP_NAME = "dealflow-admin";

let firestoreInstance: admin.firestore.Firestore | null = null;

function ensureFirebaseApp(): admin.app.App {
  // Validate env variables on bootstrap
  const validation = validateEnv();
  if (!validation.valid) {
    throw new Error(`Environment validation failed: ${validation.errors.join("; ")}`);
  }

  const sa = loadServiceAccount();
  if (!sa) {
    throw new Error(
      "Firebase Admin SDK is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH=./dealflow_firebase.json in .env.local (service account JSON, not the CLI firebase.json)."
    );
  }

  try {
    const existing = admin.app(ADMIN_APP_NAME);
    if (existing.options.projectId === sa.project_id) {
      return existing;
    }
  } catch {
    // Named app not created yet
  }

  return admin.initializeApp(
    {
      credential: admin.credential.cert(sa as admin.ServiceAccount),
      projectId: sa.project_id,
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ||
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        `${sa.project_id}.appspot.com`,
    },
    ADMIN_APP_NAME
  );
}

/** Returns Firestore bound to the named Admin app (never the credential-less default app). */
export function getDb(): admin.firestore.Firestore {
  if (!firestoreInstance) {
    firestoreInstance = ensureFirebaseApp().firestore();
  }
  return firestoreInstance;
}

/** Lazy Firestore handle for existing imports — initializes on first property access. */
export const db: admin.firestore.Firestore = new Proxy({} as admin.firestore.Firestore, {
  get(_target, prop) {
    const mock = (globalThis as any).firestoreMock;
    const real = mock || getDb();
    const value = (real as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(real);
    }
    return value;
  },
});

export function getStorage(): admin.storage.Storage {
  return ensureFirebaseApp().storage();
}

export const storage = new Proxy({} as admin.storage.Storage, {
  get(_target, prop) {
    const real = getStorage();
    const value = (real as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(real);
    }
    return value;
  },
});

export default admin;
