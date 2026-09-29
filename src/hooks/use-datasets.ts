"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DEFAULT_ACTIVE_DATASETS, getDataset } from "@/lib/datasets";
import type { FeatureCollection } from "@/types/geojson";
import type { DatasetId, MapPoint } from "@/types/dataset";

type DatasetState =
  | { status: "loading" }
  | { status: "ready"; features: readonly MapPoint[] }
  | { status: "error"; message: string };

export type DatasetsResult = {
  active: readonly DatasetId[];
  toggle: (id: DatasetId) => void;
  features: readonly MapPoint[];
  loadingCount: number;
  errors: readonly string[];
};

const EMPTY: readonly MapPoint[] = [];

export function useDatasets(): DatasetsResult {
  const [active, setActive] = useState<readonly DatasetId[]>(
    DEFAULT_ACTIVE_DATASETS,
  );
  const [states, setStates] = useState<Record<string, DatasetState>>({});

  const requested = useRef(new Set<DatasetId>());

  useEffect(() => {
    const controller = new AbortController();

    for (const id of active) {
      if (requested.current.has(id)) continue;
      requested.current.add(id);

      const info = getDataset(id);
      setStates((current) => ({ ...current, [id]: { status: "loading" } }));

      void (async () => {
        try {
          const response = await fetch(info.file, {
            signal: controller.signal,
          });
          if (!response.ok) {
            throw new Error(`Gagal memuat ${info.label} (${response.status})`);
          }

          const collection =
            (await response.json()) as FeatureCollection<MapPoint>;
          setStates((current) => ({
            ...current,
            [id]: { status: "ready", features: collection.features },
          }));
        } catch (error) {
          if (controller.signal.aborted) return;
          requested.current.delete(id);
          const message =
            error instanceof Error
              ? error.message
              : `Data ${info.label} tidak dapat dibaca`;
          setStates((current) => ({
            ...current,
            [id]: { status: "error", message },
          }));
        }
      })();
    }

    return () => controller.abort();
  }, [active]);

  const toggle = useCallback((id: DatasetId) => {
    setActive((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }, []);

  const features = useMemo(() => {
    const collected: MapPoint[] = [];
    for (const id of active) {
      const state = states[id];
      if (state?.status === "ready") collected.push(...state.features);
    }
    return collected.length > 0 ? collected : EMPTY;
  }, [active, states]);

  const loadingCount = active.filter(
    (id) => states[id]?.status === "loading",
  ).length;

  const errors = active
    .map((id) => states[id])
    .filter(
      (state): state is { status: "error"; message: string } =>
        state?.status === "error",
    )
    .map((state) => state.message);

  return { active, toggle, features, loadingCount, errors };
}
