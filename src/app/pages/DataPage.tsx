import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Calendar } from "lucide-react";
import { COLORS } from "../constants/colors";
import { ROUTES } from "../routes/routes";
import { BottomNav } from "../components/common/BottomNav";
import { PillarTabs } from "../components/iaf/PillarTabs";
import { IafIndicatorCard } from "../components/iaf/IafIndicatorCard";
import { PILLARS, PILLAR_DISPLAY_TO_KEY } from "../constants/pillars";
import { useIafReport } from "../hooks/useIafReport";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../utils/date";

export function DataPage() {
  const navigate = useNavigate();
  const { preferredPillars } = useAuth();

  // pilares visíveis: preferência do usuário ou todos se não houver seleção
  const visiblePillars = preferredPillars.length > 0
    ? preferredPillars
    : PILLARS.map((p) => p.name);

  const [activePillar, setActivePillar] = useState(visiblePillars[0] ?? PILLARS[0].name);
  const { report, loading, error, refetch } = useIafReport();

  const activePillarKey = PILLAR_DISPLAY_TO_KEY[activePillar] ?? activePillar;
  const indicators = (report?.indicators ?? []).filter(
    (ind) => ind.pillar === activePillarKey || ind.pillar === activePillar
  );

  return (
    <div
      className="w-full h-full flex flex-col text-white"
      style={{
        backgroundColor: COLORS.wine,
        backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0) 45%)",
      }}
    >
      <div className="px-6 pt-3 pb-1"><div className="h-8" /></div>

      {/* Header */}
      <div className="px-6 pt-2 pb-1 flex items-center">
        <button
          onClick={() => navigate(ROUTES.home)}
          className="w-9 h-9 rounded-full border border-white/60 flex items-center justify-center shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1 text-center pr-9">
          <h2 className="text-white">IAF · Relatório diário</h2>
          <p className="text-white/80 mt-0.5 flex items-center justify-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {report ? formatDate(report.date) : loading ? "Carregando..." : "—"}
          </p>
        </div>
      </div>

      {/* Pillar tabs */}
      <div className="pt-3">
        <PillarTabs active={activePillar} onChange={setActivePillar} pillars={visiblePillars} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-2 pb-3">
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
        {!loading && !error && report && indicators.length === 0 && (
          <p className="text-center text-white/70 py-10">
            Sem indicadores para {activePillar}
          </p>
        )}

        {/* Indicator cards */}
        {!loading &&
          !error &&
          indicators.map((ind) => (
            <IafIndicatorCard key={ind.code} indicator={ind} />
          ))}
      </div>

      <BottomNav />
    </div>
  );
}
