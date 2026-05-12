"use client";

import { Suspense } from "react";
import { ThreeScene } from "@/components/solutions-3d/ThreeScene";
import { useSystemInitialization } from "@/components/solutions-3d/useSystemInitialization";
import { Loader2, AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SolutionsPage() {
  const { data, loading, error, retry } = useSystemInitialization();

  if (error) {
    return (
      <main className="fixed inset-0 flex items-center justify-center bg-slate-950 p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-red-500/10">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Initialization Failed</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            The immersive environment could not be established. This might be due to a connection issue or system latency.
          </p>
          <div className="bg-black/40 p-3 rounded font-mono text-xs text-red-400 mb-8 text-left border border-red-500/10">
            Error: {error}
          </div>
          <Button onClick={retry} className="w-full bg-violet-600 hover:bg-violet-700 h-12 gap-2">
            <RefreshCcw className="h-4 w-4" />
            Retry Connection
          </Button>
        </div>
      </main>
    );
  }

  if (loading || !data) {
    return (
      <main className="fixed inset-0 flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-xl animate-pulse" />
            <Loader2 className="h-16 w-16 animate-spin text-violet-500 relative z-10" />
          </div>
          <div className="text-center">
            <p className="text-violet-400 font-mono tracking-[0.3em] uppercase text-sm animate-pulse mb-1">
              Establishing Neural Link
            </p>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest">
              Initializing Immersive Environment...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 overflow-hidden bg-slate-950">
      <ThreeScene data={data} />
    </main>
  );
}
