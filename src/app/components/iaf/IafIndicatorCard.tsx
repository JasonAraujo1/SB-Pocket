import { COLORS } from "../../constants/colors";
import type { IafIndicator } from "../../types/iaf";
import type { LucideIcon } from "lucide-react";

type Props = {
  indicator: IafIndicator;
  icon: LucideIcon;
};

export function IafIndicatorCard({ indicator: k, icon: Icon }: Props) {
  const barColor = k.pct >= 100 ? COLORS.teal : k.pct >= 90 ? COLORS.orange : COLORS.wine;

  return (
    <div
      className="w-full bg-transparent border border-white/70 rounded-2xl p-3 text-white"
      style={{ fontSize: "11px" }}
    >
      <div className="flex items-stretch gap-2">
        <div className="flex flex-col items-center gap-1 shrink-0 w-8">
          <span className="opacity-80">{k.idx}</span>
          <div className="w-7 h-7 rounded-full flex items-center justify-center border border-white/70">
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0 flex items-center">
          <p className="leading-tight">{k.label}</p>
        </div>

        <div className="border-l border-white/30" />

        <div className="flex flex-col gap-1 shrink-0 min-w-0">
          <div className="flex flex-col">
            <span className="text-white/70">Realizado</span>
            <span className="truncate">{k.real}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/70">Meta</span>
            <span className="truncate">{k.meta}</span>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-white whitespace-nowrap" style={{ fontSize: "14px" }}>
              {k.pct.toFixed(2)}%
            </span>
            <span className="text-white/70 whitespace-nowrap">do objetivo</span>
          </div>
          <span className="text-white/60 whitespace-nowrap" style={{ fontSize: "9px" }}>
            {k.points}
          </span>
        </div>
      </div>

      <div className="mt-2 h-1 rounded-full bg-white/25 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, k.pct)}%`,
            backgroundColor: k.pct >= 100 ? "#22C55E" : barColor,
          }}
        />
      </div>
    </div>
  );
}
