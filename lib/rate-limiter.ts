import { db } from "./firebase-admin";
import admin from "firebase-admin";
import { hashIp } from "./security";

// Define limit settings: 10 requests per minute
const MAX_LIMIT = 10;
const WINDOW_MS = 60 * 1000;

export async function checkRateLimit(req: Request): Promise<{ allowed: boolean; remainingPoints?: number; msBeforeNext?: number }> {
  try {
    // Get client IP
    let ip = "127.0.0.1";
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) {
      ip = forwardedFor.split(",")[0].trim();
    }

    const hashedIp = hashIp(ip);
    const minuteTimestamp = Math.floor(Date.now() / WINDOW_MS);
    const docId = `rl_${hashedIp}_${minuteTimestamp}`;

    if (!db) {
      // Fallback if db is not ready/mocked
      return { allowed: true, remainingPoints: 1 };
    }

    const docRef = db.collection("rate_limits").doc(docId);
    const docSnap = await docRef.get();
    
    let currentPoints = 0;
    if (docSnap.exists) {
      currentPoints = docSnap.data()?.points || 0;
    }

    const nextMinuteTime = (minuteTimestamp + 1) * WINDOW_MS;
    const msBeforeNext = nextMinuteTime - Date.now();

    if (currentPoints >= MAX_LIMIT) {
      return {
        allowed: false,
        remainingPoints: 0,
        msBeforeNext,
      };
    }

    // Atomic increment
    await docRef.set(
      {
        points: admin.firestore.FieldValue.increment(1),
        expiresAt: new Date(Date.now() + 120 * 1000), // expire in 2 minutes for TTL cleanup
      },
      { merge: true }
    );

    return {
      allowed: true,
      remainingPoints: MAX_LIMIT - (currentPoints + 1),
      msBeforeNext: 0,
    };
  } catch (error) {
    // Fail-open to avoid breaking the application for users if Firestore is temporarily offline
    console.error("[Rate Limiter] Unexpected error, fail-open allowed:", error);
    return { allowed: true, remainingPoints: 1 };
  }
}
