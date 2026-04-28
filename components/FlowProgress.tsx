"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const steps = [
  { href: "/", label: "Intake" },
  { href: "/analysis", label: "Analysis" },
  { href: "/solutions", label: "Solutions" },
  { href: "/book-demo", label: "Book demo" },
  { href: "/ai-agent-call", label: "Demo call" },
] as const;

export function FlowProgress({ current }: { current: number }) {
  return (
    <nav
      className="w-full overflow-x-auto border-b border-white/10 bg-dealflow-blue/80 backdrop-blur-md"
      aria-label="Progress"
    >
      <ol className="mx-auto flex max-w-5xl min-w-[min(100%,520px)] items-center justify-between gap-1 px-4 py-3 text-xs sm:text-sm">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s.href} className="flex flex-1 items-center">
              <Link
                href={s.href}
                className={cn(
                  "flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors",
                  active && "bg-white/10 text-white",
                  done && !active && "text-emerald-400/90",
                  !done && !active && "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold sm:h-7 sm:w-7 sm:text-xs",
                    done && "border-emerald-500/50 bg-emerald-500/20",
                    active && "border-violet-500 bg-violet-600 text-white",
                    !done && !active && "border-white/20"
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="hidden font-medium sm:inline">{s.label}</span>
              </Link>
              {i < steps.length - 1 && (
                <span
                  className="mx-0.5 hidden h-px min-w-[8px] flex-1 bg-white/10 sm:block"
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
