import { logger } from "./logger";

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateEnv(): EnvValidationResult {
  const errors: string[] = [];
  const isProd = process.env.NODE_ENV === "production";
  
  // Detect if running in a test environment to skip strict check
  const isTest = typeof process !== "undefined" && (
    process.env.NODE_ENV === "test" ||
    process.argv.some(arg => arg.includes("test"))
  );

  if (isTest) {
    return { valid: true, errors: [] };
  }

  // 1. Check JWT Secret (Critical for Security)
  if (isProd && !process.env.JWT_SECRET) {
    errors.push("JWT_SECRET environment variable is required in production environments.");
  }

  // 2. Check Firebase Configuration
  const saPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const hasSaVars = 
    process.env.FIREBASE_PROJECT_ID && 
    process.env.FIREBASE_CLIENT_EMAIL && 
    process.env.FIREBASE_PRIVATE_KEY;

  if (!saPath && !hasSaVars && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    errors.push(
      "Firebase Admin credentials are not configured. Provide FIREBASE_SERVICE_ACCOUNT_PATH or individual FIREBASE_* variables."
    );
  }

  // 3. AI configuration (Warnings only, as these are often hot-swappable)
  const provider = process.env.AI_PROVIDER || "huggingface";
  if (provider === "huggingface" && !process.env.HUGGINGFACE_API_TOKEN && !process.env.HF_TOKEN) {
    logger.warn("AI_PROVIDER is set to 'huggingface' but HUGGINGFACE_API_TOKEN is missing.");
  } else if (provider === "nvidia" && !process.env.NVIDIA_API_KEY) {
    logger.warn("AI_PROVIDER is set to 'nvidia' but NVIDIA_API_KEY is missing.");
  } else if (provider === "kimi" && !process.env.KIMI_API_KEY) {
    logger.warn("AI_PROVIDER is set to 'kimi' but KIMI_API_KEY is missing.");
  }

  if (errors.length > 0) {
    logger.error("Environment validation failed", { errors });
    return { valid: false, errors };
  }

  logger.info("Environment validation succeeded");
  return { valid: true, errors: [] };
}
