import type { ReactNode } from "react";

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="size-full min-h-screen flex items-center justify-center bg-neutral-200 p-6">
      <div className="w-full max-w-sm h-[820px] rounded-[2.5rem] overflow-hidden">
        {children}
      </div>
    </div>
  );
}
