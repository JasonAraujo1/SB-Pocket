import { useState } from "react";
import {
  SplashScreen,
  LoginScreen,
  WelcomeScreen,
  PillarsScreen,
  ReportScreen,
} from "./components/screens";

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [activePillars, setActivePillars] = useState<string[]>(
    ["Gestão Comercial", "Omni & Digital", "ESG", "Excelência Operacional", "Gestão de Pessoas", "Finanças"]
  );

  const renderScreen = () => {
    switch (screen) {
      case "login":
        return <LoginScreen onNavigate={setScreen} />;
      case "pillars":
        return <PillarsScreen onNavigate={setScreen} activePillars={activePillars} setActivePillars={setActivePillars} />;
      case "report":
        return <ReportScreen onNavigate={setScreen} activePillars={activePillars} />;
      case "welcome":
        return <WelcomeScreen onNavigate={setScreen} />;
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
