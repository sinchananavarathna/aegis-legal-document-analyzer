import { cn } from "@/lib/utils";

export function ScoreRing({
  value,
  size = 132,
}: {
  value: number;
  size?: number;
}) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  const tone =
    value >= 65 ? "text-ok" : value >= 50 ? "text-warn" : "text-danger";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="color-mix(in oklab, var(--color-fg) 10%, transparent)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className={tone}
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-display text-4xl leading-none tabular-nums", tone)}>{value}</span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-subtle">score</span>
      </div>
    </div>
  );
}
