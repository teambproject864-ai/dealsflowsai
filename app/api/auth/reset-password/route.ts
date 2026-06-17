
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db, logger } from "@/lib/firebase-admin";
import {
  DEMO_ADMIN,
  DEMO_AGENTS,
  DEMO_CUSTOMERS,
  hashPassword,
} from "@/lib/auth";

// Get JWT secret from environment or use fallback for dev
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is required in production");
    }
    return "your-secret-key-in-production-env-var-only";
  }
  return secret;
}

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Token and new password are required" },
        { status: 400 }
      );
    }

    // Verify reset token
    let decoded: any;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    if (decoded.type !== "password-reset") {
      return NextResponse.json(
        { success: false, error: "Invalid token type" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // For demo purposes, log the password reset
    logger.info(
      `[PASSWORD RESET] Password reset successful for ${decoded.email}`
    );

    // In a real app, update the user's password in the database
    // For this demo, we'll just return success since the demo users are hard-coded

    // Mark token as used in Firestore if available
    if (db) {
      const resetSnapshot = await db
        .collection("password_resets")
        .where("token", "==", token)
        .where("used", "==", false)
        .get();

      if (!resetSnapshot.empty) {
        const docRef = resetSnapshot.docs[0].ref;
        await docRef.update({
          used: true,
          usedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully! You can now log in.",
    });
  } catch (error) {
    logger.error("Error in reset password API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
