import { COLORS } from "../../constants/colors";
import type { IafIndicator, IafMetric } from "../../types/iaf";

type Props = {
  indicator: IafIndicator;
};

function metricNum(m: IafMetric | undefined): number {
  if (!m) return 0;
  if (typeof m.raw === "number") return m.raw;
  if (typeof m.raw === "string") return parseFloat(m.raw.replace(",", ".")) || 0;
  return 0;
}

function fmt(m: IafMetric | undefined): string {
  return m?.formatado || "—";
}

export function IafIndicatorCard({ indicator: k }: Props) {
  const pct = metricNum(k.percentualAtingido);
  const barColor = pct >= 100 ? "#22C55E" : COLORS.orange;

  return (
    <div
      className="w-full bg-transparent border border-white/70 rounded-2xl p-3 text-white"
      style={{ fontSize: "11px" }}
    >
      <div className="flex items-stretch gap-2">
        {/* Código */}
        <div className="flex items-start shrink-0 pt-0.5">
          <span className="opacity-70 text-[10px] leading-tight w-8 text-center">{k.code}</span>
        </div>

        {/* Título */}
        <div className="flex-1 min-w-0 flex items-center">
          <p className="leading-tight">{k.title}</p>
        </div>

        <div className="border-l border-white/30 mx-1" />

        {/* Realizado / Meta */}
        <div className="flex flex-col gap-1 shrink-0 min-w-0 text-right">
          <div className="flex flex-col">
            <span className="text-white/70">Realizado</span>
            <span className="truncate max-w-[72px]">{fmt(k.realizado)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/70">Meta</span>
            <span className="truncate max-w-[72px]">{fmt(k.metaValor)}</span>
          </div>
        </div>

        {/* % e pts */}
        <div className="flex flex-col items-end justify-between shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-white whitespace-nowrap" style={{ fontSize: "14px" }}>
              {fmt(k.percentualAtingido)}
            </span>
            <span className="text-white/70 whitespace-nowrap">do objetivo</span>
          </div>
          <span className="text-white/60 whitespace-nowrap" style={{ fontSize: "9px" }}>
            {fmt(k.pontosAtingidos)} / {fmt(k.metaPontos)}
          </span>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="mt-2 h-1 rounded-full bg-white/25 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, Math.max(0, pct))}%`,
            backgroundColor: barColor,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
