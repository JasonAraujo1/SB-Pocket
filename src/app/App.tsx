import { useState } from "react";
import {
  SplashScreen,
  LoginScreen,
  WelcomeScreen,
  PillarsScreen,
  ReportScreen,
} from "./components/screens";
import { getUserByCpf, UserProfile } from "../services/firestore";

const PILLAR_KEY_MAP: Record<string, string> = {
  gestao_comercial: "Gestão Comercial",
  omni_digital: "Omni & Digital",
  esg: "ESG",
  excelencia_operacional: "Excelência Operacional",
  gestao_pessoas: "Gestão de Pessoas",
  financas: "Finanças",
};

const DEFAULT_PILLARS = Object.values(PILLAR_KEY_MAP);

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  // preferredPillars: preferência visual do usuário — NÃO é permissão.
  // Todos os usuários têm acesso a todos os dados do relatório.
  const [preferredPillars, setPreferredPillars] = useState<string[]>(DEFAULT_PILLARS);

  const handleLogin = async (cpf: string, password: string): Promise<string | null> => {
    try {
      const user = await getUserByCpf(cpf);

      if (!user) {
        console.log("[Login] usuário não encontrado");
        return "Usuário não encontrado";
      }

      if (!user.active) {
        console.log("[Login] usuário inativo");
        return "Usuário inativo";
      }

      if (user.password !== password) {
        console.log("[Login] senha incorreta");
        return "Senha incorreta";
      }

      console.log("[Login] login autorizado");

      setCurrentUser(user);

      const mapped =
        user.selectedPillars?.length > 0
          ? user.selectedPillars.map((k) => PILLAR_KEY_MAP[k] ?? k).filter(Boolean)
          : DEFAULT_PILLARS;

      setPreferredPillars(mapped);
      setScreen("welcome");
      return null;
    } catch {
      console.error("[Login] erro ao conectar com o servidor");
      return "Erro ao conectar. Tente novamente.";
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPreferredPillars(DEFAULT_PILLARS);
    setScreen("splash");
  };

  const renderScreen = () => {
    switch (screen) {
      case "login":
        return <LoginScreen onNavigate={setScreen} onLogin={handleLogin} />;
      case "pillars":
        return <PillarsScreen onNavigate={setScreen} preferredPillars={preferredPillars} setPreferredPillars={setPreferredPillars} />;
      case "report":
        return <ReportScreen onNavigate={setScreen} />;
      case "welcome":
        return <WelcomeScreen onNavigate={setScreen} preferredPillars={preferredPillars} onLogout={handleLogout} />;
      default:
        return <SplashScreen onNavigate={setScreen} />;
    }
  };

  return (
    <div className="size-full min-h-screen flex items-center justify-center bg-neutral-200 p-6">
      <div className="w-full max-w-sm h-[820px] rounded-[2.5rem] overflow-hidden">
        {renderScreen()}
      </div>
    </div>
  );
}
