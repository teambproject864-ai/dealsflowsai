import * as fs from "fs";
import * as path from "path";

/** Matches the standard Google service account JSON downloaded from Firebase/GCP. */
export type ServiceAccountJson = {
  type?: string;
  project_id: string;
  private_key: string;
  client_email: string;
};

/** Only cache successful loads so env/file fixes apply without a full process restart. */
let cached: ServiceAccountJson | null = null;

const DEFAULT_SERVICE_ACCOUNT_FILES = [
  "dealflow_firebase.json",
  "dealflow-ai-651cb-firebase-adminsdk-fbsvc-130a39ea58.json",
] as const;

function isServiceAccountJson(json: Record<string, unknown>): json is ServiceAccountJson {
  return (
    json.type === "service_account" &&
    typeof json.project_id === "string" &&
    typeof json.client_email === "string" &&
    typeof json.private_key === "string"
  );
}

function tryReadFile(filePath: string): ServiceAccountJson | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(raw) as Record<string, unknown>;
    if (json.hosting || json.emulators) return null;
    if (isServiceAccountJson(json)) return json;
    if (
      typeof json.project_id === "string" &&
      typeof json.client_email === "string" &&
      typeof json.private_key === "string"
    ) {
      return json as ServiceAccountJson;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Loads credentials from (in order):
 * 1. `FIREBASE_SERVICE_ACCOUNT_PATH` — path to JSON (absolute or relative to cwd)
 * 2. `GOOGLE_APPLICATION_CREDENTIALS` — same as GCP convention
 * 3. `./dealflow-ai-651cb-firebase-adminsdk-fbsvc-130a39ea58.json` in project root
 * 4. `FIREBASE_PROJECT_ID` + `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`
 */
export function loadServiceAccount(): ServiceAccountJson | null {
  if (cached) return cached;

  const cwd = process.cwd();

  // Print helpful console warnings if FIREBASE_SERVICE_ACCOUNT_PATH is incorrectly set to standard firebase.json config
  // But only if we're not in static generation/build mode (avoid breaking next build)
  const saPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  if (saPath === "none" || saPath === "mock") {
    return null;
  }
  if (saPath) {
    const resolved = path.isAbsolute(saPath) ? saPath : path.join(cwd, saPath);
    if (fs.existsSync(resolved)) {
      try {
        const raw = fs.readFileSync(resolved, "utf8");
        const json = JSON.parse(raw);
        if (!json.project_id || !json.client_email || !json.private_key) {
          // Only warn if not in static build mode
          if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
            console.error(
              `\n================================================================================\n` +
              `[Firebase Config Warning] FIREBASE_SERVICE_ACCOUNT_PATH is set to "${saPath}".\n` +
              `However, this file is missing the required Service Account fields (project_id, client_email, private_key).\n` +
              (saPath.endsWith("firebase.json") && !saPath.includes("adminsdk")
                ? `Note: Root "firebase.json" is often the Firebase CLI config — use dealflow_firebase.json or your downloaded *-adminsdk-*.json key instead.\n`
                : "") +
              `Please download your service account key from the Firebase Console (Project Settings > Service Accounts)\n` +
              `and update FIREBASE_SERVICE_ACCOUNT_PATH in .env.local.\n` +
              `================================================================================\n`
            );
          }
        }
      } catch (err: any) {
        // Only log error if not in static build mode
        if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
          console.error(`[Firebase Config Error] Failed to parse service account JSON file at "${saPath}":`, err.message);
        }
      }
    } else {
      // No file found - don't log error during static build mode
    }
  }

  const paths = [
    saPath,
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim(),
    ...DEFAULT_SERVICE_ACCOUNT_FILES.map((name) => path.join(cwd, name)),
  ].filter(Boolean) as string[];

  for (const p of paths) {
    const resolved = path.isAbsolute(p) ? p : path.join(cwd, p);
    const fromFile = tryReadFile(resolved);
    if (fromFile) {
      cached = fromFile;
      return cached;
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (projectId && clientEmail && rawKey) {
    cached = {
      project_id: projectId,
      client_email: clientEmail,
      private_key: rawKey.replace(/\\n/g, "\n"),
    };
    return cached;
  }

  return null;
}

export function clearServiceAccountCache(): void {
  cached = null;
}
