import { useState, useEffect } from "react";
import { Bell, BellOff, CheckCircle2 } from "lucide-react";
import { requestOneSignalPermission, getOneSignalStatus } from "../../../services/oneSignalService";
import { useAuth } from "../../hooks/useAuth";

type PermissionState = NotificationPermission | "unsupported" | "loading";

export function NotificationPermissionCard() {
  const { currentUser } = useAuth();
  const [state, setState] = useState<PermissionState>("loading");
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) {
      setState("unsupported");
      return;
    }

    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }

    // Consulta status real do OneSignal (init silencioso na montagem)
    getOneSignalStatus()
      .then((status) => {
        setState(status.optedIn ? "granted" : Notification.permission);
      })
      .catch(() => {
        setState(Notification.permission);
      });
  }, []);

  async function handleActivate() {
    if (!currentUser || requesting) return;
    setRequesting(true);
    try {
      const result = await requestOneSignalPermission(currentUser.cpf, currentUser.name);
      console.log("[OneSignal] status", result);
      setState(result.permission ? "granted" : Notification.permission);
    } catch (err) {
      console.error("[OneSignal] erro ao ativar notificações:", err);
      setState(Notification.permission);
    } finally {
      setRequesting(false);
    }
  }

  if (state === "unsupported") return null;

  return (
    <div
      className="mx-5 mb-2 rounded-2xl p-4"
      style={{
        backgroundColor: "rgba(255,255,255,0.13)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.25)",
      }}
    >
      {state === "granted" ? (
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">Notificações ativadas</p>
            <p className="text-white/60 text-xs mt-0.5">
              Você será avisado quando uma nova atualização do IAF chegar.
            </p>
          </div>
        </div>
      ) : state === "denied" ? (
        <div className="flex items-start gap-3">
          <BellOff className="w-5 h-5 text-white/50 shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-medium">Notificações bloqueadas</p>
            <p className="text-white/60 text-xs mt-0.5">
              Para ativar, libere a permissão nas configurações do site no seu navegador.
            </p>
          </div>
        </div>
      ) : state === "loading" ? (
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-white/40 shrink-0" />
          <p className="text-white/60 text-xs">Verificando notificações...</p>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-white/80 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium">Receber atualizações do IAF</p>
            <p className="text-white/60 text-xs mt-0.5">
              Ative as notificações para ser avisado quando uma nova atualização do IAF estiver
              disponível.
            </p>
            <button
              onClick={handleActivate}
              disabled={requesting}
              className="mt-3 px-4 py-1.5 rounded-full text-sm font-semibold disabled:opacity-60 transition-opacity"
              style={{
                backgroundColor: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.35)",
              }}
            >
              {requesting ? "Aguarde..." : "Ativar notificações"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
