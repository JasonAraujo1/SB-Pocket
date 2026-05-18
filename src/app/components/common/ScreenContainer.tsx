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
      {/* Status bar spacer — considera notch em iPhones */}
      <div
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          minHeight: "calc(1.25rem + env(safe-area-inset-top, 0px))",
        }}
      />
      {children}
    </div>
  );
}
