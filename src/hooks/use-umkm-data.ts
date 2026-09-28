"use client";

import { useEffect, useState } from "react";
import type { UmkmCollection, UmkmFeature } from "@/types/umkm";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; features: readonly UmkmFeature[] }
  | { status: "error"; message: string };

export function useUmkmData(): LoadState {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    // ignore a late response if the component unmount first
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch("/data/umkm.geojson", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Gagal memuat data (${response.status})`);
        }

        const collection = (await response.json()) as UmkmCollection;
        setState({ status: "ready", features: collection.features });
      } catch (error) {
        if (controller.signal.aborted) return;
        const message =
          error instanceof Error ? error.message : "Data tidak dapat dibaca";
        setState({ status: "error", message });
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  return state;
}
