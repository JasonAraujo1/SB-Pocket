import { useState } from "react";
import sbLogo from "../../assets/C_pia_de_PADR_O_SB_LAYOUT_ONEPAGES__1080_x_1080_px_.png";
import imagePhoneIAF from "../../assets/imagePhoneIAF.gif";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  BarChart3,
  Settings,
  Bell,
  ShoppingBag,
  Smartphone,
  Leaf,
  Sliders,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Equal,
  Star,
  Gift,
  Activity,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";

type ScreenProps = {
  onNavigate: (screen: string) => void;
};

type LoginScreenProps = ScreenProps & {
  onLogin: (cpf: string, password: string) => Promise<string | null>;
};

type PillarsScreenProps = ScreenProps & {
  // preferredPillars: preferência visual — não é permissão de acesso
  preferredPillars: string[];
  setPreferredPillars: (p: string[]) => void;
};

type ReportScreenProps = ScreenProps;

const COLORS = {
  teal: "#048187",
  orange: "#EA6846",
  wine: "#7C1F31",
};

const PILLARS = [
  { name: "Gestão Comercial", icon: ShoppingBag },
  { name: "Omni & Digital", icon: Smartphone },
  { name: "ESG", icon: Leaf },
  { name: "Excelência Operacional", icon: Sliders },
  { name: "Gestão de Pessoas", icon: Users },
  { name: "Finanças", icon: DollarSign },
];

/* ---------------- Splash (primeiro contato) ---------------- */
export function SplashScreen({ onNavigate }: ScreenProps) {
  return (
    <div
      className="w-full h-full flex flex-col text-white"
      style={{
        backgroundColor: COLORS.teal,
        backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0) 45%)",
      }}
    >
      <div className="px-6 pt-8 pb-2">
        <div className="inline-flex items-center gap-2 px-0 py-0">
          <img src={sbLogo} alt="" className="w-7 h-7 rounded" />
          <div className="flex flex-col leading-tight">
            <span className="text-white/70 tracking-wider" style={{ fontSize: "9px" }}>GRUPO</span>
            <span className="text-white/70">SB monteiro</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-6">
        <h1 className="text-white mx-[0px] mt-[0px] mb-[-20px]" style={{ fontSize: "40px" }}>SB Pocket</h1>
        <p className="text-white/85">by Setor de TI</p>
        <img src={imagePhoneIAF} alt="" className="h-72 w-auto object-contain mt-2" />
      </div>

      <div className="w-full flex flex-col items-center gap-3 px-8 pb-10">
        <button
          onClick={() => onNavigate("login")}
          className="w-full max-w-xs bg-white rounded-full py-4"
          style={{ color: COLORS.teal }}
        >
          Começar
        </button>
        <p className="text-white/70 text-center max-w-[220px]">
          Informações relevantes sempre com você
        </p>
      </div>
    </div>
  );
}

/* ---------------- Login ---------------- */
export function LoginScreen({ onNavigate, onLogin }: LoginScreenProps) {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const triggerShake = () => {
    setShake(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setShake(true)));
    setTimeout(() => setShake(false), 500);
  };

  const formatCpf = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  return (
    <div
      className="w-full h-full flex flex-col text-white"
      style={{
        backgroundColor: COLORS.teal,
        backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0) 45%)",
      }}
    >
      <StatusBar />
      <div className="px-6 pt-2 pb-4 flex items-center gap-3">
        <button
          onClick={() => onNavigate("splash")}
          className="w-9 h-9 rounded-full border border-white/60 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1 text-center pr-9">
          <p className="text-white">Entrar</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 flex flex-col">
        <div className="flex flex-col items-center mt-4">
          <img src={sbLogo} alt="SB" className="w-20 h-20 rounded-2xl" />
          <h1 className="text-white mt-3">Bem-vindo</h1>
          <p className="text-white/80 mt-1 text-center">
            Entre com seu CPF e senha para continuar
          </p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const digits = cpf.replace(/\D/g, "");
            if (!digits) {
              setError("Digite seu CPF");
              triggerShake();
              return;
            }
            if (!senha) {
              setError("Digite sua senha");
              triggerShake();
              return;
            }
            setLoading(true);
            setError(null);
            const errorMsg = await onLogin(digits, senha);
            setLoading(false);
            if (errorMsg) {
              setError(errorMsg);
              triggerShake();
            }
          }}
          className="mt-8 flex flex-col gap-4"
        >
          <label className="flex flex-col gap-2">
            <span className="text-white/85">CPF</span>
            <input
              inputMode="numeric"
              autoComplete="username"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              placeholder="000.000.000-00"
              className="w-full rounded-2xl border border-white/70 bg-transparent px-4 py-3 text-white placeholder-white/50 outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-white/85">Senha</span>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full rounded-2xl border border-white/70 bg-transparent px-4 py-3 pr-12 text-white placeholder-white/50 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
              >
                {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </label>

          {error && (
            <>
              <style>{`
                @keyframes sb-shake {
                  0%, 100% { transform: translateX(0); }
                  20% { transform: translateX(-6px); }
                  40% { transform: translateX(6px); }
                  60% { transform: translateX(-4px); }
                  80% { transform: translateX(4px); }
                }
              `}</style>
              <p
                className="text-center text-white"
                style={shake ? { animation: "sb-shake 0.45s ease" } : {}}
              >
                {error}
              </p>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white py-4 mt-2 disabled:opacity-60"
            style={{ color: COLORS.teal }}
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Home (dashboard) ---------------- */
const STATUS_ICON: Record<string, any> = {
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

// preferredPillars: preferência visual do usuário para o resumo da Home — não limita acesso a dados
export function WelcomeScreen({ onNavigate, preferredPillars, onLogout }: ScreenProps & { preferredPillars: string[]; onLogout: () => void }) {
  const visibleResults = HOME_RESULTS.filter((r) => preferredPillars.includes(r.pillar));
  return (
    <div
      className="w-full h-full flex flex-col text-white"
      style={{
        backgroundColor: COLORS.teal,
        backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0) 45%)",
      }}
    >
      <StatusBar />

      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <img src={sbLogo} alt="SB" className="w-12 h-12 rounded-xl" />
            <button
              onClick={onLogout}
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
          const bgColor =
            r.status === "Distanciou"
              ? COLORS.wine
              : r.status === "Aproximou"
              ? "#22C55E"
              : COLORS.orange;
          return (
            <button
              key={r.pillar}
              onClick={() => onNavigate("report")}
              className="w-full rounded-2xl p-4 flex items-center gap-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                color: "white",
              }}
            >
              <div className="w-11 h-11 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6" style={{ color: bgColor }} />
              </div>
              <div className="flex-1 text-left flex flex-col gap-1">
                <span className="text-base font-medium whitespace-nowrap text-white">{r.pillar}</span>
                <span className="text-xs text-white/70 leading-snug">{r.text}</span>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <ChevronRight className="w-4 h-4 text-white/40" />
              </div>
            </button>
          );
        })}

          <button
            onClick={() => onNavigate("report")}
            className="text-white/90 underline-offset-4 underline py-3 self-center"
          >
            Ver tudo
          </button>
        </div>
      </div>

      <BottomNav active="home" color={COLORS.teal} onNavigate={onNavigate} />
    </div>
  );
}

/* ---------------- Pill Tabs ---------------- */
// PillarSelect: exibe todos os pilares disponíveis — sem filtro por preferência
function PillarSelect({ active, onChange }: { active: string; onChange: (p: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative w-full">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-full border border-white/70 px-4 py-2 text-white flex items-center justify-between bg-transparent"
      >
        <span>{active}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 mt-2 z-20 rounded-2xl border border-white/70 p-2 flex flex-col gap-1 bg-white/10"
          style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        >
          {PILLARS.map((p) => {
            const isActive = active === p.name;
            return (
              <button
                key={p.name}
                onClick={() => {
                  onChange(p.name);
                  setOpen(false);
                }}
                className="w-full rounded-xl px-4 py-2 text-left text-white transition-colors"
                style={{
                  backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "transparent",
                }}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PillarTabs({ active, onChange }: { active: string; onChange: (p: string) => void }) {
  return (
    <div className="px-5 pb-4">
      <PillarSelect active={active} onChange={onChange} />
    </div>
  );
}

/* ---------------- Pillars Screen ---------------- */
export function PillarsScreen({ onNavigate, preferredPillars, setPreferredPillars }: PillarsScreenProps) {
  const [selected, setSelected] = useState<string[]>(preferredPillars);

  const toggle = (p: string) => {
    const next = selected.includes(p) ? selected.filter((x) => x !== p) : [...selected, p];
    setSelected(next);
    setPreferredPillars(next);
  };


  return (
    <div
      className="w-full h-full flex flex-col text-white"
      style={{
        backgroundColor: COLORS.orange,
        backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0) 45%)",
      }}
    >
      <StatusBar />
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="px-6 pt-2 pb-4 flex items-center gap-3">
          <button
            onClick={() => onNavigate("welcome")}
            className="w-9 h-9 rounded-full border border-white/60 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1 text-center pr-9">
            <p className="text-white">Configuração</p>
          </div>
        </div>

        <div className="px-6 pb-5">
          <h2 className="text-white">Escolha os pilares</h2>
          <h2 className="text-white">do IAF</h2>
          <p className="text-white/85 mt-2">
            Selecione um ou mais para receber notificações diárias{" "}
            <em className="text-white/50 not-italic" style={{ fontStyle: "italic" }}>(por padrão, todos estão ativados).</em>
          </p>
        </div>

        <div className="px-5 flex flex-col gap-3 pb-4">
        {PILLARS.map((p) => {
          const active = selected.includes(p.name);
          const Icon = p.icon;
          return (
            <button
              key={p.name}
              onClick={() => toggle(p.name)}
              className="w-full rounded-2xl py-3 pl-4 pr-3 flex items-center justify-between border transition-opacity"
              style={{
                backgroundColor: active ? "white" : "transparent",
                color: active ? COLORS.orange : "white",
                borderColor: active ? "white" : "rgba(255,255,255,0.7)",
                cursor: "pointer",
              }}
            >
              <span className="flex items-center gap-3">
                <Icon
                  className="w-5 h-5"
                  style={{ color: active ? COLORS.orange : "white" }}
                />
                {p.name}
              </span>
              <span
                className="relative inline-flex items-center rounded-full shrink-0 transition-colors"
                style={{
                  width: "44px",
                  height: "24px",
                  backgroundColor: active ? COLORS.orange : "rgba(255,255,255,0.25)",
                  border: active ? `2px solid ${COLORS.orange}` : "2px solid rgba(255,255,255,0.7)",
                }}
              >
                <span
                  className="absolute rounded-full bg-white transition-transform"
                  style={{
                    width: "16px",
                    height: "16px",
                    transform: active ? "translateX(22px)" : "translateX(2px)",
                  }}
                />
              </span>
            </button>
          );
        })}

        </div>
      </div>

      <BottomNav active="settings" color={COLORS.orange} onNavigate={onNavigate} />
    </div>
  );
}

/* ---------------- Report Screen ---------------- */
const KPI = [
  { idx: "1.1", icon: BarChart3, label: "Alcance de Meta de Receita PEF Loja (%)", real: "R$ 1.810.871,76", meta: "R$ 2.548.762,39", pct: 71.05, points: "0,00 pts / 100,00 pts" },
  { idx: "1.2", icon: BarChart3, label: "Alcance de Meta de Receita PEF VD (%)", real: "R$ 26.633.379,81", meta: "R$ 26.635.550,53", pct: 99.99, points: "100,00 pts / 120,00 pts" },
  { idx: "1.3", icon: Users, label: "Alcance da Meta de Base", real: "10.498,00", meta: "10.732,00", pct: 97.82, points: "40,00 pts / 60,00 pts" },
  { idx: "1.4", icon: Activity, label: "Alcance da Meta de Atividade VD (%)", real: "35,00%", meta: "38,61%", pct: 90.65, points: "0,00 pts / 60,00 pts" },
  { idx: "1.5", icon: Star, label: "NPS (Loja + OMNI) (%)", real: "89,55%", meta: "90,00%", pct: 99.50, points: "33,00 pts / 35,00 pts" },
  { idx: "1.6", icon: Gift, label: "Resgate Fidelidade (%)", real: "52,82%", meta: "52,00%", pct: 101.58, points: "20,00 pts / 20,00 pts" },
];

// ReportScreen: exibe relatório completo com todos os pilares — preferredPillars não se aplica aqui
export function ReportScreen({ onNavigate }: ReportScreenProps) {
  const [activePillar, setActivePillar] = useState(PILLARS[0].name);

  return (
    <div
      className="w-full h-full flex flex-col text-white"
      style={{
        backgroundColor: COLORS.wine,
        backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0) 45%)",
        ["--bg-color" as any]: COLORS.wine,
      }}
    >
      <StatusBar />
      <div className="px-6 pt-2 pb-1 flex items-center">
        <button
          onClick={() => onNavigate("welcome")}
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
        {KPI.map((k) => {
          const Icon = k.icon;
          const barColor = k.pct >= 100 ? COLORS.teal : k.pct >= 90 ? COLORS.orange : COLORS.wine;
          return (
            <div
              key={k.idx}
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
                    backgroundColor: k.pct >= 100 ? "#22C55E" : "#EA6846",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav active="data" color={COLORS.wine} onNavigate={onNavigate} />
    </div>
  );
}

/* ---------------- Shared parts ---------------- */
function StatusBar() {
  return (
    <div className="px-6 pt-3 pb-1 flex items-center justify-between text-white">
      <div className="h-8">
      </div>
    </div>
  );
}

function BottomNav({
  active,
  color,
  onNavigate,
}: {
  active: string;
  color: string;
  onNavigate: (s: string) => void;
}) {
  const items = [
    { id: "home", label: "Home", icon: Home, target: "welcome" },
    { id: "data", label: "Dados", icon: BarChart3, target: "report" },
    { id: "settings", label: "Config", icon: Settings, target: "pillars" },
  ];
  return (
    <div className="px-3 pt-2 pb-3">
      <div className="rounded-2xl flex items-center justify-around py-2 px-1 border border-white/70 bg-transparent">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onNavigate(it.target)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-white"
              style={{ opacity: isActive ? 1 : 0.65 }}
            >
              <Icon className="w-4 h-4" />
              <span>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
