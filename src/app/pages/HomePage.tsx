import { useNavigate } from "react-router";
import {
  Bell,
  TrendingUp,
  TrendingDown,
  Equal,
  RefreshCw,
  ChevronRight,
  LogOut,
} from "lucide-react";
import sbLogo from "../../assets/C_pia_de_PADR_O_SB_LAYOUT_ONEPAGES__1080_x_1080_px_.png";
import { COLORS } from "../constants/colors";
import { ROUTES } from "../routes/routes";
import { useAuth } from "../hooks/useAuth";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { BottomNav } from "../components/common/BottomNav";

const STATUS_ICON: Record<string, typeof TrendingUp> = {
  Distanciou: TrendingDown,
  Aproximou: TrendingUp,
  Manteve: Equal,
};

const HOME_RESULTS = [
  { pillar: "Gestão Comercial", status: "Aproximou", text: "Resultado alcançado se aproximou da meta" },
  { pillar: "Omni & Digital", status: "Aproximou", text: "Resultado alcançado se aproximou da meta" },
  { pillar: "ESG", status: "Manteve", text: "Resultado alcançado manteve-se estável" },
  { pillar: "Excelência Operacional", status: "Manteve", text: "Resultado alcançado manteve-se estável" },
  { pillar: "Gestão de Pessoas", status: "Distanciou", text: "Resultado alcançado se distanciou da meta" },
  { pillar: "Finanças", status: "Distanciou", text: "Resultado alcançado se distanciou da meta" },
];

export function HomePage() {
  const navigate = useNavigate();
  const { preferredPillars, logout } = useAuth();

  const visibleResults = HOME_RESULTS.filter((r) => preferredPillars.includes(r.pillar));

  const handleLogout = () => {
    logout();
    navigate(ROUTES.login);
  };

  return (
    <ScreenContainer color={COLORS.teal}>
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <img src={sbLogo} alt="SB" className="w-12 h-12 rounded-xl" />
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-full border border-white/60 flex items-center justify-center"
            >
              <LogOut className="w-4 h-4 text-white" />
            </button>
          </div>
          <h1 className="text-white">Atualizações IAF</h1>
          <p className="text-white/85 mt-2">Bom dia! Veja os resultados de hoje</p>
        </div>

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
            <div className="w-full flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-white/60 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 flex flex-col">
                <span className="text-white">Data atualização · 13/05/2026</span>
                <span className="text-white/75">Hora atualização · 10:52</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pt-6 pb-2">
          <p className="text-white/90">Resumo resultados</p>
        </div>

        <div className="px-5 flex flex-col gap-3 pb-4">
          {visibleResults.map((r) => {
            const Icon = STATUS_ICON[r.status];
            const iconColor =
              r.status === "Distanciou" ? COLORS.wine : r.status === "Aproximou" ? "#22C55E" : COLORS.orange;
            return (
              <button
                key={r.pillar}
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
                  <Icon className="w-6 h-6" style={{ color: iconColor }} />
                </div>
                <div className="flex-1 text-left flex flex-col gap-1">
                  <span className="text-base font-medium whitespace-nowrap text-white">{r.pillar}</span>
                  <span className="text-xs text-white/70 leading-snug">{r.text}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40 shrink-0" />
              </button>
            );
          })}

          <button
            onClick={() => navigate(ROUTES.dados)}
            className="text-white/90 underline-offset-4 underline py-3 self-center"
          >
            Ver tudo
          </button>
        </div>
      </div>

      <BottomNav />
    </ScreenContainer>
  );
}
