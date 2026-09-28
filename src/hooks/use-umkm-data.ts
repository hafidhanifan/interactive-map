"use client";

import { useEffect, useState } from "react";

import { multiplyFeatures, readStressFactor } from "@/lib/stress-test";
import type { UmkmCollection, UmkmFeature } from "@/types/umkm";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; features: readonly UmkmFeature[] }
  | { status: "error"; message: string };

/**
fetches the published UMKM GeoJSON once, when the map first needs it.
the file lives in public/data, so it is a plain HTTP request rather than a bundled import. That keeps category data out of the initial javaScript payload, which matters once all seven categories exist.
*/
export function useUmkmData(): LoadState {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    // Lets us ignore a late response if the component unmounts first.
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
        const features = multiplyFeatures(
          collection.features,
          readStressFactor(),
        );

        setState({ status: "ready", features });
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
