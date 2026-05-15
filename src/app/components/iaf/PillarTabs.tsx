import { useState } from "react";

type Props = {
  active: string;
  onChange: (pillar: string) => void;
  pillars: string[];
};

export function PillarTabs({ active, onChange, pillars }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="px-5 pb-4">
      <div className="relative w-full">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full rounded-full border border-white/70 px-4 py-2 text-white flex items-center justify-between bg-transparent"
        >
          <span>{active}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <div
            className="absolute left-0 right-0 mt-2 z-20 rounded-2xl border border-white/70 p-2 flex flex-col gap-1 bg-white/10"
            style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
          >
            {pillars.map((name) => (
              <button
                key={name}
                onClick={() => { onChange(name); setOpen(false); }}
                className="w-full rounded-xl px-4 py-2 text-left text-white transition-colors"
                style={{ backgroundColor: active === name ? "rgba(255,255,255,0.25)" : "transparent" }}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
