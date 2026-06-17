import { NextResponse } from "next/server";
import { getAuthCookie, refreshToken, setAuthCookie } from "@/lib/auth";

/**
 * POST /api/auth/refresh
 * Silently refreshes the auth cookie if the current token is still valid.
 * Called client-side periodically to prevent session expiry.
 */
export async function POST() {
  const existingToken = await getAuthCookie();

  if (!existingToken) {
    return NextResponse.json(
      { success: false, error: "No active session" },
      { status: 401 }
    );
  }

  const newToken = refreshToken(existingToken);
  if (!newToken) {
    return NextResponse.json(
      { success: false, error: "Session expired — please log in again" },
      { status: 401 }
    );
  }

  await setAuthCookie(newToken);
  return NextResponse.json({ success: true });
}
