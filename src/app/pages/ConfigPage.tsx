import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Pencil, CircleHelp } from "lucide-react";
import { COLORS } from "../constants/colors";
import { ROUTES } from "../routes/routes";
import { useAuth } from "../hooks/useAuth";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { BottomNav } from "../components/common/BottomNav";
import { PillarToggle } from "../components/iaf/PillarToggle";
import { IconButton } from "../components/common/IconButton";
import { PILLARS } from "../constants/pillars";
import { getYesterdayAndTodayActiveUsersCount } from "../../services/accessLogService";
import { useOnboardingContext } from "../providers/OnboardingProvider";

export function ConfigPage() {
  const navigate = useNavigate();
  const { preferredPillars, savePillars, currentUser } = useAuth();

  const [selected, setSelected] = useState<string[]>(preferredPillars);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<"success" | "error" | null>(null);
  const [editShake, setEditShake] = useState(false);

  const editBtnRef = useRef<HTMLButtonElement>(null);

  const { startTour } = useOnboardingContext();

  const [accessCounts, setAccessCounts] = useState<{ yesterday: number; today: number } | null>(null);
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAccessCounts() {
      setAccessLoading(true);
      setAccessError(null);
      try {
        const result = await getYesterdayAndTodayActiveUsersCount();
        if (!isMounted) return;
        setAccessCounts({ yesterday: result.yesterday, today: result.today });
      } catch (error) {
        console.error("[AccessLogs] Erro ao carregar acessos:", error);
        if (!isMounted) return;
        setAccessError("Não foi possível carregar acessos");
      } finally {
        if (isMounted) setAccessLoading(false);
      }
    }

    loadAccessCounts();
    return () => { isMounted = false; };
  }, []);

  const triggerEditShake = () => {
    setEditShake(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setEditShake(true)));
    setTimeout(() => setEditShake(false), 400);
  };

  const handleToggleClick = (name: string) => {
    if (!editMode) {
      triggerEditShake();
      return;
    }
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  const handleEdit = () => {
    setEditMode(true);
    setMessage(null);
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    setMessage(null);
    try {
      await savePillars(selected);
      setMessage("success");
      setEditMode(false);
    } catch {
      setMessage("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer color={COLORS.orange}>
      <style>{`
        @keyframes sb-edit-shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          20% { transform: translateX(-4px) rotate(-8deg); }
          40% { transform: translateX(4px) rotate(8deg); }
          60% { transform: translateX(-3px) rotate(-5deg); }
          80% { transform: translateX(3px) rotate(5deg); }
        }
      `}</style>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="px-6 pt-2 pb-4 flex items-center gap-3">
          <IconButton onClick={() => navigate(ROUTES.home)}>
            <ChevronLeft className="w-5 h-5 text-white" />
          </IconButton>

          <div className="flex-1 text-center">
            <p className="text-white">Configuração</p>
          </div>

          <div className="flex items-center gap-1.5" data-tour="config-save">
            <button
              data-tour="config-help"
              onClick={() => startTour("manual")}
              className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center"
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
              aria-label="Abrir tutorial"
            >
              <CircleHelp className="w-4 h-4 text-white" />
            </button>

            {!editMode ? (
              <button
                ref={editBtnRef}
                data-tour="config-edit"
                onClick={handleEdit}
                className="w-9 h-9 rounded-full border border-white/60 flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  ...(editShake ? { animation: "sb-edit-shake 0.4s ease" } : {}),
                }}
                aria-label="Editar pilares"
              >
                <Pencil className="w-4 h-4 text-white" />
              </button>
            ) : (
              <div className="w-9 h-9" />
            )}
          </div>
        </div>

        {/* Title */}
        <div className="px-6 pb-5">
          <h2 className="text-white">Escolha os pilares do IAF</h2>
          <p className="text-white/85 mt-2">
            Selecione os pilares que deseja visualizar em destaque no app
          </p>
        </div>

        {/* Toggles */}
        <div className="px-5 flex flex-col gap-3 pb-4" data-tour="config-pillars">
          {PILLARS.map((p) => (
            <PillarToggle
              key={p.key}
              pillar={p}
              active={selected.includes(p.name)}
              disabled={!editMode}
              onClick={() => handleToggleClick(p.name)}
            />
          ))}

          {/* Save / Error */}
          {editMode && (
            <>
              {message === "error" && (
                <p className="text-center text-white">Erro ao salvar preferências</p>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !currentUser}
                className="w-full rounded-full bg-white py-4 mt-2 disabled:opacity-60"
                style={{ color: COLORS.orange }}
              >
                {saving ? "Salvando..." : "Salvar escolhas"}
              </button>
            </>
          )}

          {!editMode && message === "success" && (
            <p className="text-center text-white">Preferências salvas</p>
          )}
        </div>
      </div>

      {/* Footer de acessos */}
      <div className="px-6 py-2 border-t border-white/20 text-center">
        {accessLoading && (
          <p className="text-white/40 text-xs">Carregando acessos...</p>
        )}
        {!accessLoading && accessError && (
          <p className="text-white/40 text-xs">{accessError}</p>
        )}
        {!accessLoading && !accessError && accessCounts && (
          <div className="flex justify-center gap-6 text-white/40 text-xs">
            <span>Ativos ontem: {accessCounts.yesterday}</span>
            <span>Ativos hoje: {accessCounts.today}</span>
          </div>
        )}
      </div>

      <BottomNav />
    </ScreenContainer>
  );
}
