import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";

type MapShellProps = {
  children: ReactNode;
  overlay?: ReactNode;
};

export function MapShell({ children, overlay }: MapShellProps) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <AppHeader />

      <div className="relative min-h-0 flex-1">
        {children}

        {overlay ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-500">
            <div className="pointer-events-auto">{overlay}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
