import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-slate-950 py-8 px-4">
      <div className="container mx-auto flex justify-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-violet-600/20 font-bold text-violet-400 border border-violet-500/30 transition-all group-hover:bg-violet-600 group-hover:text-white">
            DF
          </div>
          <span className="text-sm font-bold tracking-tighter text-slate-400 transition-colors group-hover:text-white">
            DEALFLOW<span className="text-violet-500/70 group-hover:text-violet-500">.AI</span>
          </span>
        </Link>
      </div>
    </footer>
  );
}
