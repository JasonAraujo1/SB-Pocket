import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Calendar, BarChart3, Users, Activity, Star, Gift } from "lucide-react";
import { COLORS } from "../constants/colors";
import { ROUTES } from "../routes/routes";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { BottomNav } from "../components/common/BottomNav";
import { PillarTabs } from "../components/iaf/PillarTabs";
import { IafIndicatorCard } from "../components/iaf/IafIndicatorCard";
import { PILLARS } from "../constants/pillars";
import type { IafIndicator } from "../types/iaf";
import type { LucideIcon } from "lucide-react";

const KPI_ICONS: LucideIcon[] = [BarChart3, BarChart3, Users, Activity, Star, Gift];

const KPI_DATA: IafIndicator[] = [
  { idx: "1.1", label: "Alcance de Meta de Receita PEF Loja (%)", real: "R$ 1.810.871,76", meta: "R$ 2.548.762,39", pct: 71.05, points: "0,00 pts / 100,00 pts" },
  { idx: "1.2", label: "Alcance de Meta de Receita PEF VD (%)", real: "R$ 26.633.379,81", meta: "R$ 26.635.550,53", pct: 99.99, points: "100,00 pts / 120,00 pts" },
  { idx: "1.3", label: "Alcance da Meta de Base", real: "10.498,00", meta: "10.732,00", pct: 97.82, points: "40,00 pts / 60,00 pts" },
  { idx: "1.4", label: "Alcance da Meta de Atividade VD (%)", real: "35,00%", meta: "38,61%", pct: 90.65, points: "0,00 pts / 60,00 pts" },
  { idx: "1.5", label: "NPS (Loja + OMNI) (%)", real: "89,55%", meta: "90,00%", pct: 99.50, points: "33,00 pts / 35,00 pts" },
  { idx: "1.6", label: "Resgate Fidelidade (%)", real: "52,82%", meta: "52,00%", pct: 101.58, points: "20,00 pts / 20,00 pts" },
];

export function DataPage() {
  const navigate = useNavigate();
  const [activePillar, setActivePillar] = useState(PILLARS[0].name);

  return (
    <div
      className="w-full h-full flex flex-col text-white"
      style={{
        backgroundColor: COLORS.wine,
        backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0) 45%)",
      }}
    >
      <div className="px-6 pt-3 pb-1"><div className="h-8" /></div>

      <div className="px-6 pt-2 pb-1 flex items-center">
        <button
          onClick={() => navigate(ROUTES.home)}
          className="w-9 h-9 rounded-full border border-white/60 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1 text-center pr-9">
          <h2 className="text-white">IAF · Relatório diário</h2>
          <p className="text-white/80 mt-0.5 flex items-center justify-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> 05 de maio de 2026
          </p>
        </div>
      </div>

      <div className="pt-3">
        <PillarTabs active={activePillar} onChange={setActivePillar} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-2 pb-3">
        {KPI_DATA.map((k, i) => (
          <IafIndicatorCard key={k.idx} indicator={k} icon={KPI_ICONS[i]} />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
