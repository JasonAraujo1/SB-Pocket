import { AuthProvider } from "./providers/AuthProvider";
import { OnboardingProvider } from "./providers/OnboardingProvider";
import { MobileFrame } from "./layouts/MobileFrame";
import { AppRoutes } from "./routes/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <MobileFrame>
          <AppRoutes />
        </MobileFrame>
      </OnboardingProvider>
    </AuthProvider>
  );
}
