import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Joyride, STATUS, ACTIONS, type CallBackProps } from "react-joyride";
import { ALL_STEPS, JOYRIDE_STYLES } from "../components/common/AppJoyride";

interface OnboardingContextValue {
  startTour: (mode?: "auto" | "manual") => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboardingContext(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboardingContext must be inside OnboardingProvider");
  return ctx;
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [run, setRun] = useState(false);
  const [tourKey, setTourKey] = useState(0);

  const handleCallback = useCallback(
    (data: CallBackProps) => {
      console.log("[Joyride callback]", data);
      const { status, action } = data;

      const shouldClose =
        status === STATUS.FINISHED ||
        status === STATUS.SKIPPED ||
        action === ACTIONS.CLOSE;

      if (!shouldClose) return;

      setRun(false);
    },
    [],
  );

  const startTour = useCallback((mode: "auto" | "manual" = "manual") => {
    console.log("[Joyride] localStorage:", localStorage.getItem("sbpocket_onboarding_seen"));
    console.log("[Joyride] mode:", mode);
    setRun(false);
    // Incrementar a key força o remount do Joyride, reiniciando do step 0.
    setTimeout(() => {
      setTourKey((k) => k + 1);
      setRun(true);
    }, 50);
  }, []);

  return (
    <OnboardingContext.Provider value={{ startTour }}>
      {children}
      <Joyride
        key={tourKey}
        steps={ALL_STEPS}
        run={run}
        continuous
        showSkipButton
        showProgress
        scrollToFirstStep
        disableOverlayClose={false}
        spotlightClicks={false}
        scrollOffset={80}
        callback={handleCallback}
        locale={{
          back: "Voltar",
          close: "Fechar",
          last: "Concluir",
          next: "Próximo",
          skip: "Pular",
        }}
        styles={JOYRIDE_STYLES}
      />
    </OnboardingContext.Provider>
  );
}
