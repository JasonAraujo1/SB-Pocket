import type { ReactNode } from "react";

type Props = {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
};

export function IconButton({ onClick, children, className = "", ...rest }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-9 h-9 rounded-full border border-white/60 flex items-center justify-center ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
