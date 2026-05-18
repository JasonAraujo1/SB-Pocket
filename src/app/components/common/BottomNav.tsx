import { NavLink } from "react-router";
import { Home, BarChart3, Settings } from "lucide-react";
import { ROUTES } from "../../routes/routes";

const NAV_ITEMS = [
  { label: "Home", icon: Home, to: ROUTES.home },
  { label: "Dados", icon: BarChart3, to: ROUTES.dados },
  { label: "Config", icon: Settings, to: ROUTES.config },
];

export function BottomNav() {
  return (
    <div
      className="shrink-0 px-3 pt-2"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))" }}
    >
      <div className="rounded-2xl flex items-center justify-around py-2 px-1 border border-white/70 bg-transparent">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-white text-[11px] ${
                  isActive ? "opacity-100" : "opacity-60"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
