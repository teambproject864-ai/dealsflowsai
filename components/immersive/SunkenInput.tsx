"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useImmersive } from "./ImmersiveProvider";

export interface SunkenInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SunkenInput = React.forwardRef<HTMLInputElement, SunkenInputProps>(
  ({ className, ...props }, ref) => {
    const { reducedMotion } = useImmersive();

    return (
      <input
        ref={ref}
        className={cn(
          "immersive-input-sunken flex h-11 w-full rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500",
          "border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-950/60",
          "shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_4px_12px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 dark:focus-visible:ring-teal-400/50",
          "focus-visible:shadow-[inset_0_2px_4px_rgba(0,0,0,0.05),0_0_0_1px_rgba(20,184,166,0.4),0_0_20px_rgba(20,184,166,0.15)] dark:focus-visible:shadow-[inset_0_4px_12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(45,212,191,0.4),0_0_20px_rgba(45,212,191,0.15)]",
          !reducedMotion && "transition-shadow duration-300",
          className
        )}
        {...props}
      />
    );
  }
);
SunkenInput.displayName = "SunkenInput";
