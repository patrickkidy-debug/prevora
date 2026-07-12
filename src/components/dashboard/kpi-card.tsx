import Link from "next/link";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

/** Compact sparkline (inline SVG, no chart lib) normalized to the series range. */
function Sparkline({
  data,
  color,
  id,
}: {
  data: number[];
  color: string;
  id: string;
}) {
  const pts = data.filter((n) => typeof n === "number" && !Number.isNaN(n));
  if (pts.length < 2) return <div className="h-9" />;

  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;
  const w = 100;
  const h = 32;
  const step = w / (pts.length - 1);
  const line = pts
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(
          h -
          ((v - min) / range) * (h - 4) -
          2
        ).toFixed(1)}`,
    )
    .join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-9 w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${id})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface KpiCardProps {
  label: string;
  icon: string;
  value: string | number;
  unit?: string;
  /** Change vs yesterday. Positive = improvement (green). */
  delta?: number | null;
  deltaSuffix?: string;
  spark: number[];
  color: string;
  href: string;
}

export function KpiCard({
  label,
  icon,
  value,
  unit,
  delta,
  deltaSuffix = "",
  spark,
  color,
  href,
}: KpiCardProps) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  const hasDelta = delta != null && delta !== 0;
  const up = (delta ?? 0) > 0;

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* glow */}
      <span
        className="pointer-events-none absolute -right-6 -top-6 size-16 rounded-full opacity-15 blur-2xl transition-opacity group-hover:opacity-30"
        style={{ background: color }}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span
            className="grid size-8 place-items-center rounded-lg"
            style={{ backgroundColor: `color-mix(in oklch, ${color} 16%, transparent)`, color }}
          >
            <Icon name={icon} className="size-4" />
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold tabular-nums leading-none">
        {value}
        {unit && (
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </p>

      <div className="mt-1.5 flex items-center gap-1 text-xs">
        {hasDelta ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              up ? "text-success" : "text-destructive",
            )}
          >
            {up ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {up ? "+" : ""}
            {Math.round((delta as number) * 10) / 10}
            {deltaSuffix}
          </span>
        ) : (
          <span className="inline-flex items-center gap-0.5 text-muted-foreground">
            <Minus className="size-3" /> stable
          </span>
        )}
        <span className="text-muted-foreground">vs hier</span>
      </div>

      <div className="mt-3">
        <Sparkline data={spark} color={color} id={id} />
      </div>
    </Link>
  );
}
