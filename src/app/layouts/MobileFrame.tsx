import type { ReactNode } from "react";

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    // Mobile: fundo simples, sem padding, sem centralização vertical
    // Desktop (sm+): fundo cinza, padding, card centralizado com bordas arredondadas
    <div className="min-h-dvh bg-neutral-200 sm:flex sm:items-center sm:justify-center sm:p-6">
      <div
        className="
          relative w-full max-w-[430px] overflow-hidden
          h-dvh
          rounded-none
          sm:h-[820px] sm:rounded-[2.5rem]
        "
      >
        {children}
      </div>
    </div>
  );
}
