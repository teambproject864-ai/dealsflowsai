import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "./firebase-admin";
import { logger } from "./logger";

// --- Constants & Configuration ---
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRITICAL SECURITY ERROR: JWT_SECRET environment variable is not defined in production.");
    }
    return "your-secret-key-in-production-env-var-only";
  }
  return secret;
}
const JWT_EXPIRES_IN = "8h"; // 8-hour sessions — auto-refreshed on activity
const AUTH_COOKIE_NAME = "df_auth_token";
const SALT_ROUNDS = 12;

// --- Types ---
export type UserRole = "admin" | "agent" | "customer";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

interface DemoAgent {
  id: string;
  email: string;
  hashedPassword: string;
  name: string;
  role: "agent";
}

interface DemoCustomer {
  id: string;
  email: string;
  hashedPassword: string;
  name: string;
  role: "customer";
}

// --- Demo User Data (replace with real DB in production) ---
export const DEMO_ADMIN = {
  id: "admin-1",
  email: "admin@dealflow.ai",
  name: "Administrator",
  role: "admin" as const,
};

export const DEMO_AGENTS: DemoAgent[] = [
  {
    id: "agent-praneeth",
    email: "praneeth@dealflow.ai",
    // Hashed password for "Praneeth123!"
    hashedPassword: "$2b$12$V0TqSpuJrnZGSRfourZpLu8OxZPZ74dThGLE8Q1OznLwmg8iDSuJK",
    name: "Praneeth",
    role: "agent",
  },
  {
    id: "agent-ashok",
    email: "agent.ashok@dealflow.ai",
    // Hashed password for "AgentAshok456!"
    hashedPassword: "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
    name: "Ashok Agent",
    role: "agent",
  },
];

// --- Demo Customer Data ---
export const DEMO_CUSTOMERS: DemoCustomer[] = [
  {
    id: "customer-demo",
    email: "demo@customer.com",
    // Hashed password for "CustomerDemo123!"
    hashedPassword: "$2b$12$R7o34Nx1z9Y0P5q7V8b4A0Qw7e2Z1x3P5q7V8b4A0Qw7e2Z1x3P5q7V",
    name: "Demo Customer",
    role: "customer",
  },
  {
    id: "customer-praneeth",
    email: "praneethburada@gmail.com",
    // Hashed password for "Praneeth@123"
    hashedPassword: "$2b$12$KOR/mZadApvr3V6EMSE1WezgudOUX1UU51QoVudLOPXSAv2Meijkq",
    name: "Praneeth Burada",
    role: "customer",
  },
  {
    id: "customer-anil",
    email: "anil@cralgo.com",
    // Hashed password for "Anil@123!"
    hashedPassword: "$2b$12$4nI.PqBx9Wr8si749DrYquPZ0l1Eceo1/aRfyj2fyDLjVEY0Yd/s2",
    name: "Anil Kumar",
    role: "customer",
  },
];

// --- In-memory new customers (legacy fallback, now stored in Firestore) ---
export let NEW_CUSTOMERS: DemoCustomer[] = [];

// --- Audit Logging ---
export function addAuditLog(
  email: string,
  role: UserRole | "unknown",
  success: boolean,
  message: string,
  ip?: string,
  userAgent?: string
) {
  const log = {
    id: `log-${Date.now()}-${Math.random()}`,
    timestamp: new Date().toISOString(),
    email,
    role,
    success,
    ip: ip || "unknown",
    userAgent: userAgent || "unknown",
    message,
  };

  // Write structured JSON log
  logger.info(`[AUDIT LOG] ${message}`, log);

  // Persist to Firestore asynchronously
  if (db) {
    db.collection("audit_logs")
      .add(log)
      .catch((err) => {
        logger.error("Failed to write audit log to Firestore", err);
      });
  }
}

// --- Password Hashing ---
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

export async function verifyPassword(
  plaintext: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plaintext, hashed);
}

// --- JWT Token Management ---
export function createToken(user: AuthUser): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Refreshes a valid token — reissues a fresh JWT if the current one is still valid.
 * Returns null if the token is expired or invalid.
 */
export function refreshToken(existingToken: string): string | null {
  const payload = verifyToken(existingToken);
  if (!payload) return null;
  const user: AuthUser = {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
  };
  return createToken(user);
}

// --- Cookie Management ---
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true, // Secure from XSS
    secure: process.env.NODE_ENV === "production", // Only HTTPS in production
    sameSite: "lax", // Prevent CSRF
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours (matches JWT expiry)
  });
}

export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value || null;
}

export async function deleteAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

// --- Current User Helper ---
export async function getAuthenticatedUser(req?: Request): Promise<AuthUser | null> {
  let token = await getAuthCookie();
  
  if (!token && req) {
    const authHeader = req.headers.get("authorization") ?? "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }
  
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
  };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  return getAuthenticatedUser();
}

/**
 * Reusable RBAC/Auth Guard for Next.js endpoints.
 */
export async function requireAuth(
  req: Request,
  allowedRoles?: UserRole[]
): Promise<{ user: AuthUser | null; errorResponse?: NextResponse }> {
  const user = await getAuthenticatedUser(req);
  
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      ),
    };
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      user,
      errorResponse: NextResponse.json(
        { success: false, error: "Forbidden: insufficient permissions" },
        { status: 403 }
      ),
    };
  }
  
  return { user };
}
