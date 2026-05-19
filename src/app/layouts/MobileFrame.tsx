import type { ReactNode } from "react";

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#048187] sm:bg-neutral-200 sm:flex sm:items-center sm:justify-center sm:p-4 md:p-5 lg:p-6">
      <div
        className="
          relative w-full max-w-[430px] overflow-hidden
          h-dvh rounded-none
          sm:h-[min(820px,calc(100dvh-2rem))] sm:rounded-[2.5rem]
          md:max-w-[470px] md:h-[min(860px,calc(100dvh-2.5rem))]
          lg:max-w-[520px] lg:h-[min(920px,calc(100dvh-3rem))]
        "
      >
        {children}
      </div>
    </div>
  );
}
