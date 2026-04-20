import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong";
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        variant === "strong" ? "glass-strong" : "glass",
        "rounded-2xl",
        className,
      )}
      {...props}
    />
  ),
);
GlassCard.displayName = "GlassCard";