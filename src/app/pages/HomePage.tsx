import { useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Bell,
  TrendingUp,
  TrendingDown,
  Equal,
  Clock,
  RefreshCw,
  LogOut,
  Medal,
  ArrowUp,
  ArrowDown,
  Minus,
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
import type { IafPillarCard } from "../types/iaf";
import { formatReportTime } from "../utils/date";
import type { IafPillarSummary } from "../types/iaf";
import { hasSeenOnboarding, markOnboardingAsSeen } from "../hooks/useOnboarding";
import { useOnboardingContext } from "../providers/OnboardingProvider";

function getFirstName(name?: string): string {
  if (!name) return "";
  const first = name.trim().split(/\s+/)[0];
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

const SHORT_NAMES: Record<string, string> = {
  "Excelência Operacional": "Excelência Op.",
};

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

function getPointsTrend(
  currentRaw?: number | string | null,
  previousRaw?: number | string | null
): "up" | "down" | "stable" | "none" {
  if (typeof currentRaw !== "number" || typeof previousRaw !== "number") return "none";
  if (currentRaw > previousRaw) return "up";
  if (currentRaw < previousRaw) return "down";
  return "stable";
}

function formatRating(rating?: string | null): string {
  if (!rating) return "—";
  if (rating === "UNCLASSIFIED") return "Não classificado";
  return rating;
}

function findPillarCard(cards: IafPillarCard[] | undefined, pillarKey: string): IafPillarCard | null {
  if (!cards?.length) return null;
  return cards.find((c) => c.key === pillarKey) ?? null;
}

function formatPercent(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${Number(value).toFixed(1)}%`;
}

function getPillarCard(key: string, summary: IafPillarSummary) {
  const cfg = STATUS_CONFIG[summary.status] ?? STATUS_CONFIG.pending_comparison;
  const name = PILLAR_KEY_MAP[key] ?? key;
  const currentPercent = formatPercent(summary.currentValue ?? summary.averagePercentual);
  const variationLabel = summary.variationLabel ?? "";
  return { key, name, cfg, currentPercent, variationLabel, text: summary.message ?? cfg.text };
}

export function HomePage() {
  const navigate = useNavigate();
  const { preferredPillars, logout, currentUser } = useAuth();
  const firstName = getFirstName(currentUser?.name);
  const { report, loading, error, refetch } = useIafReport();
  const { startTour } = useOnboardingContext();

  useEffect(() => {
    if (!currentUser) return;

    const alreadySeen = hasSeenOnboarding();
    console.log("[Joyride] alreadySeen:", alreadySeen);
    console.log("[Joyride] localStorage:", localStorage.getItem("sbpocket_onboarding_seen"));

    if (alreadySeen) return;

    // Marcar como visto ANTES de iniciar — garante que F5 ou fechamento
    // abrupto do navegador não reexiba o tour.
    markOnboardingAsSeen();
    startTour("auto");
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <p className="text-white/85 mt-2">
            {firstName ? `Olá, ${firstName}! Veja os resultados de hoje` : "Olá! Veja os resultados de hoje"}
          </p>
        </div>

        {/* Update card */}
        <div className="px-5 pt-4" data-tour="home-ranking">
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
            @keyframes sb-bounce-up {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }
            @keyframes sb-bounce-down {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(4px); }
            }
          `}</style>
          <div className="border border-white/60 rounded-2xl p-5 text-white">
            {/* Ícone central no topo */}
            <div className="flex justify-center mb-4">
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
            </div>

            {/* 2 colunas */}
            {(() => {
              const rs = report?.rankingSummary;
              const prev = report?.previousRankingSummary;
              const trend = getPointsTrend(rs?.points.raw, prev?.points.raw);
              const TrendIcon =
                trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
              const trendColor =
                trend === "up" ? "#34d399" : trend === "down" ? "#f87171" : "rgba(255,255,255,0.35)";
              const trendAnimation =
                trend === "up" ? "sb-bounce-up 0.9s ease-in-out infinite"
                : trend === "down" ? "sb-bounce-down 0.9s ease-in-out infinite"
                : undefined;

              return (
                <div className="flex items-stretch gap-4">
                  {/* Coluna esquerda — Atualização */}
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-sm text-white/60">Classificação atual</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Medal className="w-4 h-4 text-white/70 shrink-0" />
                      <span className="text-sm text-white leading-snug">
                        {formatRating(rs?.rating)}
                      </span>
                    </div>
                  </div>

                  {/* Divisor vertical */}
                  <div className="w-px bg-white/25 self-stretch" />

                  {/* Coluna direita — Pontuação */}
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="text-sm text-white/60">Pontuação do CP</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xl font-semibold text-white leading-tight">
                        {rs?.points.formatado ?? "—"}
                      </span>
                      {trend !== "none" && (
                        <TrendIcon className="w-4 h-4 shrink-0" style={{ color: trendColor, animation: trendAnimation }} />
                      )}
                    </div>
                    <span className="text-sm text-white/75">
                      {rs?.percentage.formatado ?? "—"}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Rodapé com botão de atualizar */}
            <div className="mt-4 pt-3 border-t border-white/20 flex items-center gap-3">
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
              <span className="text-sm text-white/55">
                {report
                  ? `Atualizado · ${formatReportTime(report)}`
                  : loading ? "Carregando..." : "Sem dados de atualização"}
              </span>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="px-6 pt-6 pb-2">
          <p className="text-white/90">Resumo resultados</p>
        </div>

        <div className="px-5 flex flex-col gap-3 pb-4" data-tour="home-pillars">
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
              const pillarCard = findPillarCard(report?.pillarsCards, c.key);
              return (
                <button
                  key={c.key}
                  onClick={() => navigate(`${ROUTES.dados}?pilar=${c.key}`)}
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
                  <div className="flex-1 text-left flex flex-col gap-0.5 min-w-0">
                    {/* Título + variação */}
                    <div className="flex items-center justify-between gap-3 w-full">
                      <span className="text-base font-medium text-white truncate">{SHORT_NAMES[c.name] ?? c.name}</span>
                      {c.variationLabel && (
                        <span className="text-xs font-semibold shrink-0" style={{ color: c.cfg.color }}>
                          {c.variationLabel}
                        </span>
                      )}
                    </div>
                    {/* Atingimento e Falta p/ Meta */}
                    {pillarCard && (
                      <span className="text-xs text-white/75 mt-0.5">
                        Atingimento {pillarCard.achievement.formatado} • Falta p/ Meta {pillarCard.untilGoal.formatado}
                      </span>
                    )}
                    {/* Média geral */}
                    <span className="text-xs text-white/70">
                      Média indicadores {c.currentPercent}
                    </span>
                    {/* Mensagem */}
                    <span className="text-xs text-white/55 leading-snug">{c.text}</span>
                  </div>
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
