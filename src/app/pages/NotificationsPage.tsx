import { TrendingUp, TrendingDown, Equal, Clock, Bell } from "lucide-react";
import { COLORS } from "../constants/colors";
import { useIafReport } from "../hooks/useIafReport";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { BottomNav } from "../components/common/BottomNav";
import { PILLARS, PILLAR_KEY_MAP } from "../constants/pillars";
import { formatDate } from "../utils/date";
import type { IafPillarSummary } from "../types/iaf";

const STATUS_CONFIG = {
  up: {
    Icon: TrendingUp,
    color: "#22C55E",
    text: "Resultado alcançado se aproximou da meta",
  },
  down: {
    Icon: TrendingDown,
    color: COLORS.wine,
    text: "Resultado alcançado se distanciou da meta",
  },
  stable: {
    Icon: Equal,
    color: COLORS.orange,
    text: "Resultado alcançado manteve-se estável",
  },
  pending_comparison: {
    Icon: Clock,
    color: "rgba(255,255,255,0.6)",
    text: "Aguardando comparação com relatório anterior",
  },
} as const;

function getConfig(summary: IafPillarSummary) {
  return STATUS_CONFIG[summary.status] ?? STATUS_CONFIG.pending_comparison;
}

export function NotificationsPage() {
  const { report, loading, error, refetch } = useIafReport();

  const notifications = PILLARS.map((p) => {
    const summary = report?.pillarsSummary?.[p.key];
    if (!summary) return null;
    const cfg = getConfig(summary);
    return {
      key: p.key,
      name: PILLAR_KEY_MAP[p.key] ?? p.name,
      cfg,
      message: summary.message ?? cfg.text,
      pct: typeof summary.averagePercentual === "number"
        ? `${summary.averagePercentual.toFixed(1)}%`
        : null,
    };
  }).filter(Boolean) as {
    key: string;
    name: string;
    cfg: (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG];
    message: string;
    pct: string | null;
  }[];

  return (
    <ScreenContainer color={COLORS.teal}>
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full border border-white/60 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white leading-tight">Notificações</h1>
              {report && (
                <p className="text-white/70 text-sm">
                  Relatório de {formatDate(report.date)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 flex flex-col gap-3 pb-4">
          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-10">
              <style>{`@keyframes sb-spin{to{transform:rotate(360deg)}}`}</style>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "3px solid rgba(255,255,255,0.25)",
                  borderTopColor: "rgba(255,255,255,0.9)",
                  animation: "sb-spin 0.75s linear infinite",
                }}
              />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-8">
              <p className="text-white/80 text-sm">{error}</p>
              <button
                onClick={refetch}
                className="mt-3 px-5 py-2 rounded-full border border-white/60 text-white text-sm"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* No report */}
          {!loading && !error && !report && (
            <p className="text-center text-white/70 py-10">Nenhum relatório encontrado</p>
          )}

          {/* Notification cards */}
          {!loading &&
            !error &&
            notifications.map((n) => {
              const { Icon, color } = n.cfg;
              return (
                <div
                  key={n.key}
                  className="w-full rounded-2xl p-4 flex items-center gap-4"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ border: "1px solid rgba(255,255,255,0.4)" }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-white font-medium text-sm">{n.name}</span>
                      {n.pct && (
                        <span className="text-white/60 text-xs">{n.pct}</span>
                      )}
                    </div>
                    <p className="text-white/70 text-xs mt-0.5 leading-snug">{n.message}</p>
                  </div>
                </div>
              );
            })}

          {!loading && !error && report && notifications.length === 0 && (
            <p className="text-center text-white/70 py-8">
              Sem notificações disponíveis
            </p>
          )}
        </div>
      </div>

      <BottomNav />
    </ScreenContainer>
  );
}
