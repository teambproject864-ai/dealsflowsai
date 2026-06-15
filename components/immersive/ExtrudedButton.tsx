"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Magnetic } from "./Magnetic";
import { RippleSurface } from "./RippleSurface";
import { useImmersive } from "./ImmersiveProvider";
import { SPRING_PRESS } from "@/lib/immersive3d/motion";

const extrudedVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 gpu-accelerated immersive-touch-press",
  {
    variants: {
      variant: {
        default:
          "immersive-btn-extrude bg-gradient-to-b from-teal-500 to-teal-700 text-white border border-teal-400/30",
        outline:
          "immersive-btn-extrude-outline bg-teal-50/50 dark:bg-white/5 text-teal-700 dark:text-teal-200 border border-teal-400/50 dark:border-teal-500/40 hover:bg-teal-100/50 dark:hover:bg-white/10",
        ghost:
          "immersive-btn-flat text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/5",
        destructive:
          "immersive-btn-extrude bg-red-600/90 text-white border border-red-400/30",
      },
      size: {
        default: "h-10 px-5 text-sm rounded-xl",
        sm: "h-9 px-4 text-xs rounded-lg",
        lg: "h-12 px-8 text-base rounded-2xl",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ExtrudedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof extrudedVariants> {
  asChild?: boolean;
  magnetic?: boolean;
}

export const ExtrudedButton = React.forwardRef<HTMLButtonElement, ExtrudedButtonProps>(
  (
    { className, variant, size, asChild = false, magnetic = true, children, disabled, ...props },
    ref
  ) => {
    const { enableLite, reducedMotion } = useImmersive();
    const Comp = asChild ? Slot : "button";

    const buttonEl = (
      <motion.div
        style={{ transformStyle: "preserve-3d", display: "inline-flex" }}
        whileTap={
          enableLite && !reducedMotion && !disabled
            ? { scale: 0.94, translateZ: -6 }
            : undefined
        }
        whileHover={
          enableLite && !reducedMotion && !disabled
            ? { translateZ: 8, scale: 1.02 }
            : undefined
        }
        transition={SPRING_PRESS}
      >
        <Comp
          className={cn(extrudedVariants({ variant, size, className }))}
          ref={ref}
          disabled={disabled}
          {...props}
        >
          {children}
        </Comp>
      </motion.div>
    );

    const withRipple = (
      <RippleSurface className="inline-flex rounded-xl" disabled={disabled}>
        {buttonEl}
      </RippleSurface>
    );

    if (magnetic && enableLite && !reducedMotion) {
      return <Magnetic className="inline-flex">{withRipple}</Magnetic>;
    }

    return withRipple;
  }
);
ExtrudedButton.displayName = "ExtrudedButton";
