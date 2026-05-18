import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ChevronLeft, Calendar } from "lucide-react";
import { COLORS } from "../constants/colors";
import { ROUTES } from "../routes/routes";
import { BottomNav } from "../components/common/BottomNav";
import { PageLoader } from "../components/common/PageLoader";
import { PillarTabs } from "../components/iaf/PillarTabs";
import { IafIndicatorCard } from "../components/iaf/IafIndicatorCard";
import { PILLARS, PILLAR_DISPLAY_TO_KEY, PILLAR_KEY_MAP, SOURCE_KEY_TO_PILLAR_KEY, indicatorBelongsToPillar } from "../constants/pillars";
import { useIafReport } from "../hooks/useIafReport";
import { formatReportDate } from "../utils/date";

// DataPage mostra TODOS os pilares — selectedPillars é só filtro visual da Home
const ALL_PILLAR_NAMES = PILLARS.map((p) => p.name);

export function DataPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Pilar inicial: query param ?pilar=gestao_pessoas → normaliza legacy → nome de exibição
  const rawPillarKey = searchParams.get("pilar") ?? "";
  const normalizedPillarKey = SOURCE_KEY_TO_PILLAR_KEY[rawPillarKey] ?? rawPillarKey;
  const initialPillar = PILLAR_KEY_MAP[normalizedPillarKey] ?? PILLARS[0].name;

  const [activePillar, setActivePillar] = useState(initialPillar);
  const { report, loading, error, refetch } = useIafReport();

  const allIndicators = report?.indicators ?? [];
  const activePillarKey = PILLAR_DISPLAY_TO_KEY[activePillar] ?? activePillar;
  const filteredIndicators = allIndicators.filter(
    (ind) => indicatorBelongsToPillar(ind.pillar, activePillarKey)
  );

  console.log("[Dados] total indicators:", allIndicators.length);
  console.log("[Dados] selectedPillar:", activePillarKey);
  console.log("[Dados] filteredIndicators:", filteredIndicators.length);
  console.log("[Dados] pillars disponíveis:", [...new Set(allIndicators.map((i) => i.pillar))]);

  return (
    <div
      className="relative w-full h-full flex flex-col text-white"
      style={{
        backgroundColor: COLORS.wine,
        backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0) 45%)",
      }}
    >
      <div style={{ paddingTop: "env(safe-area-inset-top, 0px)", minHeight: "calc(1.25rem + env(safe-area-inset-top, 0px))" }} />

      {/* Header */}
      <div className="px-6 pt-2 pb-1 flex items-center">
        <button
          onClick={() => navigate(ROUTES.home)}
          className="w-9 h-9 rounded-full border border-white/60 flex items-center justify-center shrink-0"
          style={{ backgroundColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1 text-center pr-9">
          <h2 className="text-white">IAF · Relatório diário</h2>
          <p className="text-white/80 mt-0.5 flex items-center justify-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {report ? formatReportDate(report) : loading ? "Carregando..." : "—"}
          </p>
        </div>
      </div>

      {/* Pillar tabs */}
      <div className="pt-3">
        <PillarTabs active={activePillar} onChange={setActivePillar} pillars={ALL_PILLAR_NAMES} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-2 pb-3">
        {loading && <PageLoader />}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-10">
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

        {/* No indicators for this pillar */}
        {!loading && !error && report && filteredIndicators.length === 0 && (
          <p className="text-center text-white/70 py-10">
            Nenhum indicador disponível para este pilar
          </p>
        )}

        {/* Indicator cards */}
        {!loading &&
          !error &&
          filteredIndicators.map((ind, index) => (
            <IafIndicatorCard key={`${ind.pillar}-${ind.code}-${index}`} indicator={ind} />
          ))}
      </div>

      <BottomNav />
    </div>
  );
}
