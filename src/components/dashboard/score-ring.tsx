import { cn } from "@/lib/utils";

const CIRC = 2 * Math.PI * 15.5; // r=15.5 in a 36x36 viewBox

/** Circular progress ring for a 0-100 score. Pure/presentational. */
export function ScoreRing({
  value,
  size = 72,
  color = "var(--color-primary)",
  label,
  className,
  strokeWidth = 3,
}: {
  value: number;
  size?: number;
  color?: string;
  label?: React.ReactNode;
  className?: string;
  strokeWidth?: number;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * CIRC;

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg className="-rotate-90" viewBox="0 0 36 36" width={size} height={size}>
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          className="stroke-muted"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${CIRC}`}
          style={{ transition: "stroke-dasharray 700ms ease" }}
        />
      </svg>
      <span className="absolute flex flex-col items-center leading-none">
        {label ?? <span className="text-lg font-semibold">{Math.round(pct)}</span>}
      </span>
    </div>
  );
}
