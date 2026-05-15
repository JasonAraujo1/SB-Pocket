import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "./routes";
import type { ReactNode } from "react";

export function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <style>{`
          @keyframes sb-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "3px solid rgba(255, 255, 255, 0.3)",
            borderTopColor: "rgba(255, 255, 255, 0.9)",
            animation: "sb-spin 0.75s linear infinite",
          }}
        />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to={ROUTES.login} replace />;

  return <>{children}</>;
}
