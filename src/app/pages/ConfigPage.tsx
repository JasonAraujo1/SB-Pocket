import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Pencil } from "lucide-react";
import { COLORS } from "../constants/colors";
import { ROUTES } from "../routes/routes";
import { useAuth } from "../hooks/useAuth";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { BottomNav } from "../components/common/BottomNav";
import { PillarToggle } from "../components/iaf/PillarToggle";
import { IconButton } from "../components/common/IconButton";
import { PILLARS } from "../constants/pillars";

export function ConfigPage() {
  const navigate = useNavigate();
  const { preferredPillars, savePillars, currentUser } = useAuth();

  const [selected, setSelected] = useState<string[]>(preferredPillars);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<"success" | "error" | null>(null);
  const [editShake, setEditShake] = useState(false);

  const editBtnRef = useRef<HTMLButtonElement>(null);

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

          {!editMode ? (
            <button
              ref={editBtnRef}
              onClick={handleEdit}
              className="w-9 h-9 rounded-full border border-white/60 flex items-center justify-center"
              style={editShake ? { animation: "sb-edit-shake 0.4s ease" } : {}}
              aria-label="Editar pilares"
            >
              <Pencil className="w-4 h-4 text-white" />
            </button>
          ) : (
            <div className="w-9 h-9" />
          )}
        </div>

        {/* Title */}
        <div className="px-6 pb-5">
          <h2 className="text-white">Escolha os pilares do IAF</h2>
          <p className="text-white/85 mt-2">
            Selecione os pilares que deseja visualizar em destaque no app
          </p>
        </div>

        {/* Toggles */}
        <div className="px-5 flex flex-col gap-3 pb-4">
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

      <BottomNav />
    </ScreenContainer>
  );
}
