import { useNavigate } from "react-router";
import {
  Bell,
  TrendingUp,
  TrendingDown,
  Equal,
  Clock,
  RefreshCw,
  ChevronRight,
  LogOut,
} from "lucide-react";
import sbLogo from "../../assets/C_pia_de_PADR_O_SB_LAYOUT_ONEPAGES__1080_x_1080_px_.png";
import { COLORS } from "../constants/colors";
import { ROUTES } from "../routes/routes";
import { useAuth } from "../hooks/useAuth";
import { useIafReport } from "../hooks/useIafReport";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { BottomNav } from "../components/common/BottomNav";
import { PageLoader } from "../components/common/PageLoader";
import { PILLARS, PILLAR_KEY_MAP } from "../constants/pillars";
import { formatDate, formatTime } from "../utils/date";
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

function getPillarCard(key: string, summary: IafPillarSummary) {
  const cfg = STATUS_CONFIG[summary.status] ?? STATUS_CONFIG.pending_comparison;
  const name = PILLAR_KEY_MAP[key] ?? key;
  const pct =
    typeof summary.averagePercentual === "number"
      ? `${summary.averagePercentual.toFixed(1)}%`
      : null;
  return { key, name, cfg, pct, text: summary.message ?? cfg.text };
}

export function HomePage() {
  const navigate = useNavigate();
  const { preferredPillars, logout } = useAuth();
  const { report, loading, error, refetch } = useIafReport();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.login);
  };

  // Build cards from pillarsSummary in PILLARS order, filtered by preferredPillars
  const summaryCards = PILLARS.map((p) => {
    const summary = report?.pillarsSummary?.[p.key];
    if (!summary) return null;
    return getPillarCard(p.key, summary);
  })
    .filter(Boolean)
    .filter((c) => !preferredPillars.length || preferredPillars.includes(c!.name)) as ReturnType<typeof getPillarCard>[];

  return (
    <ScreenContainer color={COLORS.teal}>
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <img src={sbLogo} alt="SB" className="w-12 h-12 rounded-xl" />
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-full border border-white/60 flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
            >
              <LogOut className="w-4 h-4 text-white" />
            </button>
          </div>
          <h1 className="text-white">Atualizações IAF</h1>
          <p className="text-white/85 mt-2">Bom dia! Veja os resultados de hoje</p>
        </div>

        {/* Update card */}
        <div className="px-5 pt-4">
          <div className="border border-white/60 rounded-2xl p-5 flex flex-col items-center text-white">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border border-white/60 flex items-center justify-center">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <div
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: COLORS.teal, border: "1px solid rgba(255,255,255,0.6)" }}
              >
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <p className="text-white mt-3">Atualização diária</p>
            <div className="w-full h-px bg-white/30 my-3" />
            <style>{`
              @keyframes sb-wiggle {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-12deg); }
                75% { transform: rotate(12deg); }
              }
              @keyframes sb-spin-once {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
            <div className="w-full flex items-center gap-3">
              <button
                onClick={refetch}
                className="w-9 h-9 rounded-full border border-white/60 flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
                aria-label="Atualizar dados"
              >
                <RefreshCw
                  className="w-4 h-4 text-white"
                  style={{
                    animation: loading
                      ? "sb-spin-once 0.6s linear infinite"
                      : "sb-wiggle 2.4s ease-in-out infinite",
                  }}
                />
              </button>
              <div className="flex-1 flex flex-col">
                {report ? (
                  <>
                    <span className="text-white">
                      Data atualização · {formatDate(report.date)}
                    </span>
                    <span className="text-white/75">
                      Hora atualização · {formatTime(report.createdAt ?? report.executedAt)}
                    </span>
                  </>
                ) : (
                  <span className="text-white/70">
                    {loading ? "Carregando..." : "Sem dados de atualização"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="px-6 pt-6 pb-2">
          <p className="text-white/90">Resumo resultados</p>
        </div>

        <div className="px-5 flex flex-col gap-3 pb-4">
          {loading && <PageLoader />}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-6">
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
            <p className="text-center text-white/70 py-6">Nenhum relatório encontrado</p>
          )}

          {/* Pillar cards */}
          {!loading &&
            !error &&
            summaryCards.map((c) => {
              const { Icon, color } = c.cfg;
              return (
                <button
                  key={c.key}
                  onClick={() => navigate(ROUTES.dados)}
                  className="w-full rounded-2xl p-4 flex items-center gap-4"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    color: "white",
                  }}
                >
                  <div className="w-11 h-11 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  <div className="flex-1 text-left flex flex-col gap-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-medium text-white">{c.name}</span>
                      {c.pct && (
                        <span className="text-xs text-white/70">{c.pct}</span>
                      )}
                    </div>
                    <span className="text-xs text-white/70 leading-snug">{c.text}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40 shrink-0" />
                </button>
              );
            })}

          {!loading && !error && report && summaryCards.length === 0 && (
            <p className="text-center text-white/70 py-4">
              Nenhum pilar no resumo disponível
            </p>
          )}

          {!loading && !error && report && (
            <button
              onClick={() => navigate(ROUTES.dados)}
              className="text-white/50 underline-offset-4 underline py-3 self-center text-xs"
            >
              ver mais
            </button>
          )}
        </div>
      </div>

      <BottomNav />
    </ScreenContainer>
  );
}
