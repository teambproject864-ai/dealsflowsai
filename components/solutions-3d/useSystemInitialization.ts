"use client";

import { useState, useEffect, useCallback } from "react";

export interface SystemData {
  metrics: {
    memoryUsage: number;
    cpuLoad: number;
    uptime: number;
    vector: any;
  };
  users: Array<{
    id: string;
    name: string;
    role: string;
    lastSeen: string;
  }>;
  timestamp: string;
}

export function useSystemInitialization() {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchMetrics = useCallback(async () => {
    console.log(`[Init] Fetching system metrics (Attempt ${retryCount + 1})...`);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch("/api/system/metrics", { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "API returned failure");

      console.log("[Init] Metrics successfully retrieved.");
      setData(result);
      setLoading(false);
      setError(null);
    } catch (err: any) {
      console.error(`[Init] Failed to load metrics:`, err.message);
      
      if (retryCount < 3) {
        const backoff = Math.pow(2, retryCount) * 1000;
        console.log(`[Init] Retrying in ${backoff}ms...`);
        setTimeout(() => setRetryCount(prev => prev + 1), backoff);
      } else {
        setError(err.message || "Initialization timed out after multiple attempts.");
        setLoading(false);
      }
    }
  }, [retryCount]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { data, loading, error, retry: () => setRetryCount(0) };
}
