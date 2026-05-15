import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  color: string;
  className?: string;
};

export function ScreenContainer({ children, color, className = "" }: Props) {
  return (
    <div
      className={`relative w-full h-full flex flex-col text-white ${className}`}
      style={{
        backgroundColor: color,
        backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0) 45%)",
      }}
    >
      {/* status bar spacer */}
      <div className="px-6 pt-3 pb-1">
        <div className="h-8" />
      </div>
      {children}
    </div>
  );
}
