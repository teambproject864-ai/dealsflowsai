import { NextRequest, NextResponse } from "next/server";
import {
  DEMO_ADMIN,
  DEMO_AGENTS,
  DEMO_CUSTOMERS,
  NEW_CUSTOMERS,
  verifyPassword,
  createToken,
  setAuthCookie,
  addAuditLog,
} from "@/lib/auth";
import { verifyTOTP } from "@/lib/totp";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["admin", "agent", "customer"]),
  mfaCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    const { email, password, role, mfaCode } = validation.data;
    const ip = (req as any).ip || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // ── IP Whitelisting for Admin ──────────────────────────────
    if (role === "admin" && process.env.ADMIN_IP_WHITELIST) {
      const whitelist = process.env.ADMIN_IP_WHITELIST.split(",").map(item => item.trim());
      if (!whitelist.includes(ip) && ip !== "127.0.0.1" && ip !== "::1" && ip !== "unknown") {
        addAuditLog(email, role, false, `IP not whitelisted: ${ip}`, ip, userAgent);
        return NextResponse.json(
          { success: false, error: "Access denied from this IP address" },
          { status: 403 }
        );
      }
    }

    let user = null;

    if (role === "admin") {
      if (email === DEMO_ADMIN.email) {
        const adminHash = process.env.ADMIN_PASSWORD_HASH || "$2b$12$uk3Jhz4U/imu0ltb85adU.djZHTwzPvDh36hemik5qYWSHgKlKJPq";
        const isValidPassword = await verifyPassword(password, adminHash);
        
        if (isValidPassword) {
          // Check if MFA is required and provided
          if (!mfaCode) {
            return NextResponse.json(
              { success: false, requireMfa: true, error: "Two-factor authentication required" },
              { status: 403 }
            );
          }
          
          // Verify TOTP MFA code
          const mfaSecret = process.env.ADMIN_MFA_SECRET || "JBSWY3DPEHPK3PXP";
          const isValidMfa = verifyTOTP(mfaSecret, mfaCode);
          if (!isValidMfa) {
            addAuditLog(email, role, false, "Invalid MFA code", ip, userAgent);
            return NextResponse.json(
              { success: false, error: "Invalid 2FA code" },
              { status: 401 }
            );
          }
          
          user = { ...DEMO_ADMIN, role: "admin" as const };
        }
      }
    } else if (role === "agent") {
      const agent = DEMO_AGENTS.find((a) => a.email === email);
      if (agent) {
        const isValidPassword = await verifyPassword(password, agent.hashedPassword);
        if (isValidPassword) {
          user = { id: agent.id, email: agent.email, name: agent.name, role: "agent" as const };
        }
      }
    } else if (role === "customer") {
      // Check Firestore users first, then fall back to demo customers
      let customer = null;
      const { db } = await import("@/lib/firebase-admin");
      if (db) {
        const snap = await db.collection("users").where("email", "==", email).where("role", "==", "customer").get();
        if (!snap.empty) {
          const doc = snap.docs[0];
          customer = { id: doc.id, ...doc.data() } as any;
        }
      }
      
      if (!customer) {
        customer = [...DEMO_CUSTOMERS, ...NEW_CUSTOMERS].find((c) => c.email === email);
      }

      if (customer) {
        const isValidPassword = await verifyPassword(password, customer.hashedPassword);
        if (isValidPassword) {
          user = { id: customer.id, email: customer.email, name: customer.name, role: "customer" as const };
        }
      }
    }

    if (!user) {
      addAuditLog(
        email,
        role,
        false,
        "Invalid email or password",
        ip,
        userAgent
      );
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = createToken(user);
    await setAuthCookie(token);

    addAuditLog(
      user.email,
      user.role,
      true,
      "Successful login",
      ip,
      userAgent
    );

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("[Login Error]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
