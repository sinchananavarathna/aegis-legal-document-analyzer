import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  children,
}: {
  className?: string;
  tone?: "neutral" | "ok" | "warn" | "danger" | "accent";
  children: ReactNode;
}) {
  const tones = {
    neutral: "border-border text-muted",
    ok: "border-[color-mix(in_oklab,var(--color-ok)_40%,transparent)] text-ok",
    warn: "border-[color-mix(in_oklab,var(--color-warn)_40%,transparent)] text-warn",
    danger: "border-[color-mix(in_oklab,var(--color-danger)_40%,transparent)] text-danger",
    accent: "border-[color-mix(in_oklab,var(--color-accent)_40%,transparent)] text-accent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
