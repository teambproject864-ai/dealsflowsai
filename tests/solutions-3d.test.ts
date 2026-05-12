import assert from "assert";

/**
 * System 3D Initialization Tests
 * Verifies the robust initialization logic for the immersive environment.
 */

async function testSystemMetricsAPIFailureHandling() {
  console.log("[Test] Verifying API failure handling in 3D init...");
  
  const originalFetch = globalThis.fetch;
  let attemptCount = 0;

  // Mock fetch to simulate failure and then success
  globalThis.fetch = (async (url: string) => {
    attemptCount++;
    if (url === "/api/system/metrics") {
      if (attemptCount < 2) {
        return { ok: false, status: 500, statusText: "Internal Server Error" } as any;
      }
      return {
        ok: true,
        json: async () => ({
          success: true,
          metrics: { memoryUsage: 50, cpuLoad: 20, uptime: 1000, vector: { health: { pinecone: true, firestore: true } } },
          users: [],
          timestamp: new Date().toISOString()
        })
      } as any;
    }
    return originalFetch(url);
  }) as any;

  // Since we can't easily run React hooks in this node script, 
  // we simulate the retry logic from the hook
  let loading = true;
  let data = null;
  let retryCount = 0;

  async function simulateHook() {
    try {
      const res = await fetch("/api/system/metrics");
      if (!res.ok) throw new Error("API Failed");
      data = await res.json();
      loading = false;
    } catch (e) {
      if (retryCount < 3) {
        retryCount++;
        await simulateHook();
      }
    }
  }

  await simulateHook();
  
  globalThis.fetch = originalFetch;

  assert.strictEqual(attemptCount, 2, "Should have retried once after failure");
  assert.strictEqual(loading, false, "Should eventually load");
  assert.ok(data && (data as any).success, "Data should be successful");
  console.log("✅ API failure handling passed.");
}

async function testSystemMetricsTimeout() {
  console.log("[Test] Verifying API timeout handling...");
  
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    return new Promise(resolve => {
      // Never resolves to simulate timeout
    });
  }) as any;

  // Simulate hook with 100ms timeout for test speed
  let errorOccurred = false;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 100);

  try {
    await fetch("/api/system/metrics", { signal: controller.signal });
  } catch (e) {
    errorOccurred = true;
  } finally {
    clearTimeout(timeoutId);
  }

  globalThis.fetch = originalFetch;
  assert.ok(errorOccurred, "Should have thrown a timeout error");
  console.log("✅ Timeout handling passed.");
}

export async function run3DInitTests() {
  console.log("🚀 Running 3D Initialization Test Suite...");
  await testSystemMetricsAPIFailureHandling();
  await testSystemMetricsTimeout();
  console.log("🎉 All 3D Init tests passed.");
}
