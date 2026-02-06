import * as React from "react";
import { cn } from "@/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "live" | "bullish" | "bearish" | "neutral";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  // Mapping variants to existing CSS classes where possible
  const variantClasses = {
    default: "bg-[var(--accent-green)] text-black hover:bg-[var(--accent-green-dim)]",
    secondary: "bg-[var(--bg-secondary)] text-[var(--text-secondary)]",
    destructive: "bg-[var(--accent-red)] text-white shadow-sm hover:bg-[var(--accent-red)]/80",
    outline: "text-[var(--text-primary)] border border-[var(--border-color)]",
    live: "badge-live",
    bullish: "bg-[var(--accent-green-soft)] text-[var(--accent-green)] border border-[var(--accent-green)]/20",
    bearish: "bg-[var(--accent-red-soft)] text-[var(--accent-red)] border border-[var(--accent-red)]/20",
    neutral: "bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] border border-[var(--accent-orange)]/20",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
