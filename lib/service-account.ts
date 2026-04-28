import * as fs from "fs";
import * as path from "path";

/** Matches the standard Google service account JSON downloaded from Firebase/GCP. */
export type ServiceAccountJson = {
  type?: string;
  project_id: string;
  private_key: string;
  client_email: string;
};

let cached: ServiceAccountJson | null | undefined;

const DEFAULT_FILENAME = "dealflow-ai-651cb-firebase-adminsdk-fbsvc-130a39ea58.json";

function tryReadFile(filePath: string): ServiceAccountJson | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(raw) as ServiceAccountJson;
    if (
      json.project_id &&
      json.client_email &&
      typeof json.private_key === "string"
    ) {
      return json;
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
  if (cached !== undefined) return cached;

  const cwd = process.cwd();
  const paths = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim(),
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim(),
    path.join(cwd, DEFAULT_FILENAME),
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

  cached = null;
  return null;
}
