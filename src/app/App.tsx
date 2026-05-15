import { AuthProvider } from "./providers/AuthProvider";
import { MobileFrame } from "./layouts/MobileFrame";
import { AppRoutes } from "./routes/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <MobileFrame>
        <AppRoutes />
      </MobileFrame>
    </AuthProvider>
  );
}
