import { Routes, Route, Navigate } from "react-router";
import { PrivateRoute } from "./PrivateRoute";
import { ROUTES } from "./routes";
import { SplashPage } from "../pages/SplashPage";
import { LoginPage } from "../pages/LoginPage";
import { HomePage } from "../pages/HomePage";
import { DataPage } from "../pages/DataPage";
import { ConfigPage } from "../pages/ConfigPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.splash} element={<SplashPage />} />
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route
        path={ROUTES.home}
        element={<PrivateRoute><HomePage /></PrivateRoute>}
      />
      <Route
        path={ROUTES.dados}
        element={<PrivateRoute><DataPage /></PrivateRoute>}
      />
      <Route
        path={ROUTES.config}
        element={<PrivateRoute><ConfigPage /></PrivateRoute>}
      />
      <Route path="*" element={<Navigate to={ROUTES.splash} replace />} />
    </Routes>
  );
}
