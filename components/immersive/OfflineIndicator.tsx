"use client";

import { useEffect, useState, useCallback } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { getAllUnsyncedLeads, markLeadSynced, db } from "@/lib/offlineStore";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const checkUnsynced = useCallback(async () => {
    try {
      const unsynced = await getAllUnsyncedLeads();
      setUnsyncedCount(unsynced.length);
    } catch (err) {
      console.error("Failed to check unsynced counts:", err);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    const unsynced = await getAllUnsyncedLeads();
    if (unsynced.length === 0 || syncing) return;

    setSyncing(true);
    let successCount = 0;

    for (const lead of unsynced) {
      try {
        const res = await fetch("/api/leads/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lead.data),
        });
        const result = await res.json();
        if (result.success) {
          await markLeadSynced(lead.leadId);
          successCount++;
        }
      } catch (err) {
        console.error("Failed to sync lead offline:", lead.leadId, err);
      }
    }

    await checkUnsynced();
    setSyncing(false);

    if (successCount > 0) {
      // show success feedback
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
    }
  }, [checkUnsynced, syncing]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check of unsynced items
    checkUnsynced();

    // Set up a listener for Dexie changes or poll occasionally
    const interval = setInterval(checkUnsynced, 10000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [checkUnsynced, triggerSync]);

  return (
    <>
      {/* Top right floating network monitor badge */}
      <div className="fixed top-24 right-6 z-[100] flex flex-col gap-2 pointer-events-auto">
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-red-500/30 bg-red-950/60 backdrop-blur-md text-red-200 text-xs font-semibold shadow-lg shadow-red-950/30"
            >
              <WifiOff className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>Offline Mode Active (Cached)</span>
            </motion.div>
          )}

          {isOnline && unsyncedCount > 0 && (
            <motion.button
              onClick={triggerSync}
              disabled={syncing}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-amber-500/30 bg-amber-950/60 backdrop-blur-md text-amber-200 text-xs font-semibold shadow-lg shadow-amber-950/30 hover:border-amber-400/50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncing ? "Syncing..." : `Sync ${unsyncedCount} Offline Lead${unsyncedCount > 1 ? "s" : ""}`}</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Slide-out alert banner for connectivity status changes */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-[100] p-4 rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-lg shadow-2xl max-w-sm flex gap-3"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              isOnline ? "bg-teal-500/20 text-teal-400" : "bg-red-500/20 text-red-400"
            }`}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {isOnline ? "Back Online" : "Connection Lost"}
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {isOnline
                  ? "Reconnected to the DealFlow.AI cloud. Offline operations are syncing."
                  : "Using cached state. Form responses and preferences will be saved locally and synced automatically when you reconnect."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
