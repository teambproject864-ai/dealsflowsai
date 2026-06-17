import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#030712] text-white relative overflow-hidden flex flex-col justify-between">
      {/* Premium glowing matrix grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Background radial space gradients */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[130px] pointer-events-none animate-pulse" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-slate-950/40 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="h-3 w-3 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)] group-hover:scale-110 transition-transform duration-300" />
          <span className="font-mono text-xs uppercase tracking-widest text-slate-400 font-bold transition-colors group-hover:text-slate-200">
            DEALFLOW<span className="text-violet-500">.AI</span>
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <section className="container mx-auto px-6 pt-24 pb-32 relative z-10 max-w-2xl flex-grow flex flex-col items-center justify-center text-center space-y-8">
        <div className="space-y-4">
          <h1 className="font-display text-8xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-300 to-teal-300 drop-shadow-xl animate-pulse">
            404
          </h1>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Lost in the Pipeline
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            The RevOps agents couldn't find the page you are looking for. It might have been moved, deleted, or was never qualified.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold font-mono uppercase tracking-wider text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-all duration-300 shadow-lg shadow-violet-500/25 hover:-translate-y-0.5"
          >
            Back to Home
          </Link>
          <Link
            href="/portal"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold font-mono uppercase tracking-wider text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 shadow-lg hover:shadow-violet-500/5 hover:-translate-y-0.5"
          >
            Access Portal
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950/20 py-6 text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600">
          &copy; {new Date().getFullYear()} DEALFLOW.AI. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </main>
  );
}
