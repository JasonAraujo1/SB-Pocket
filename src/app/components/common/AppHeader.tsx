import type { ReactNode } from "react";

type Props = {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
};

export function AppHeader({ title, left, right }: Props) {
  return (
    <div className="px-6 pt-2 pb-4 flex items-center gap-3">
      <div className="w-9 h-9 shrink-0">{left}</div>
      {title !== undefined && (
        <div className="flex-1 text-center">
          <p className="text-white">{title}</p>
        </div>
      )}
      <div className="w-9 h-9 shrink-0 flex items-center justify-end">{right}</div>
    </div>
  );
}
