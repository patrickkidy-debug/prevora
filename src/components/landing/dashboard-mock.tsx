import { Moon, Footprints, Droplet, TrendingUp } from "lucide-react";

const CIRC = 2 * Math.PI * 42;

function Ring({ value }: { value: number }) {
  const dash = (value / 100) * CIRC;
  return (
    <div className="relative grid size-28 place-items-center">
      <svg className="size-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${CIRC}`}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-white">82</span>
        <span className="text-[0.6rem] text-white/50">Bien-être</span>
      </div>
    </div>
  );
}

function MiniRow({
  icon: Icon,
  label,
  value,
  pct,
  color,
}: {
  icon: typeof Moon;
  label: string;
  value: string;
  pct: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="grid size-8 shrink-0 place-items-center rounded-lg"
        style={{ backgroundColor: `${color}22`, color }}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between text-[0.7rem]">
          <span className="text-white/60">{label}</span>
          <span className="font-medium text-white/90">{value}</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      </div>
    </div>
  );
}

/** Premium dashboard mockup used in the hero and product preview. */
export function DashboardMock() {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#0d1420]/90 p-5 shadow-2xl backdrop-blur-xl">
      {/* header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[0.65rem] text-white/40">Jeudi 9 juillet</p>
          <p className="text-sm font-semibold text-white">Bonjour Alex 👋</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-amber-400/15 px-2.5 py-1 text-[0.65rem] font-medium text-amber-300">
          🔥 12 jours
        </div>
      </div>

      <div className="flex items-center gap-5">
        <Ring value={82} />
        <div className="flex-1 space-y-3">
          <MiniRow icon={Moon} label="Sommeil" value="7 h 40" pct={78} color="#8b7cf6" />
          <MiniRow icon={Footprints} label="Activité" value="42 min" pct={90} color="#34d399" />
          <MiniRow icon={Droplet} label="Hydratation" value="6 verres" pct={65} color="#38bdf8" />
        </div>
      </div>

      {/* chart */}
      <div className="mt-5 rounded-xl border border-white/8 bg-white/[0.02] p-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[0.7rem] text-white/50">Bien-être · 14 jours</span>
          <span className="flex items-center gap-1 text-[0.7rem] font-medium text-emerald-400">
            <TrendingUp className="size-3" /> +6 %
          </span>
        </div>
        <svg viewBox="0 0 300 70" className="h-16 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 50 L25 46 L50 48 L75 38 L100 40 L125 30 L150 34 L175 24 L200 28 L225 18 L250 22 L275 14 L300 12 L300 70 L0 70 Z"
            fill="url(#areaGrad)"
          />
          <path
            d="M0 50 L25 46 L50 48 L75 38 L100 40 L125 30 L150 34 L175 24 L200 28 L225 18 L250 22 L275 14 L300 12"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
