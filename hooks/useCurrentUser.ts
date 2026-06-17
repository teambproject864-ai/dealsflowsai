"use client";

import { useState, useEffect, useCallback } from "react";

interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError("Failed to fetch user data");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Handle automatic silent session refresh
  useEffect(() => {
    if (!user) return;

    const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
    let lastRefresh = Date.now();

    const refreshSession = async () => {
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST" });
        if (res.ok) {
          lastRefresh = Date.now();
          console.log("[useCurrentUser] Session auto-refreshed successfully");
        } else if (res.status === 401) {
          setUser(null);
        }
      } catch (err) {
        console.error("[useCurrentUser] Failed to auto-refresh session:", err);
      }
    };

    const interval = setInterval(refreshSession, REFRESH_INTERVAL);

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastRefresh > REFRESH_INTERVAL) {
        refreshSession();
      }
    };

    window.addEventListener("click", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
    };
  }, [user]);

  return { user, isLoading, error, refetchUser: fetchUser };
}

