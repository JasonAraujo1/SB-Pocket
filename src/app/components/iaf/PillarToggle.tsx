import { COLORS } from "../../constants/colors";
import type { PillarDef } from "../../constants/pillars";

type Props = {
  pillar: PillarDef;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export function PillarToggle({ pillar, active, disabled = false, onClick }: Props) {
  const Icon = pillar.icon;

  return (
    <button
      onClick={onClick}
      aria-disabled={disabled}
      className="w-full rounded-2xl py-3 pl-4 pr-3 flex items-center justify-between border transition-opacity"
      style={{
        backgroundColor: active ? "white" : "transparent",
        color: active ? COLORS.orange : "white",
        borderColor: active ? "white" : "rgba(255,255,255,0.7)",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.85 : 1,
      }}
    >
      <span className="flex items-center gap-3">
        <Icon className="w-5 h-5" style={{ color: active ? COLORS.orange : "white" }} />
        {pillar.name}
      </span>
      <span
        className="relative inline-flex items-center rounded-full shrink-0 transition-colors"
        style={{
          width: "44px",
          height: "24px",
          backgroundColor: active ? COLORS.orange : "rgba(255,255,255,0.25)",
          border: active ? `2px solid ${COLORS.orange}` : "2px solid rgba(255,255,255,0.7)",
        }}
      >
        <span
          className="absolute rounded-full bg-white transition-transform"
          style={{
            width: "16px",
            height: "16px",
            transform: active ? "translateX(22px)" : "translateX(2px)",
          }}
        />
      </span>
    </button>
  );
}
