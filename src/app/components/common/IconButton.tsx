import React from "react";

type Props = {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
};

const frosted: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
};

export function IconButton({ onClick, children, className = "", style, ...rest }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-9 h-9 rounded-full border border-white/60 flex items-center justify-center ${className}`}
      style={{ ...frosted, ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}
