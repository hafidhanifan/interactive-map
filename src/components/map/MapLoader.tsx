"use client";

import dynamic from "next/dynamic";

const BaseMap = dynamic(() => import("./BaseMap").then((mod) => mod.BaseMap), {
  ssr: false,
  loading: () => <MapLoadingState />,
});

function MapLoadingState() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface-muted">
      <p className="text-sm text-ink-muted">Memuat peta...</p>
    </div>
  );
}

export function MapLoader() {
  return <BaseMap />;
}
