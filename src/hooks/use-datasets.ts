"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DEFAULT_ACTIVE_DATASETS, getDataset } from "@/lib/datasets";
import type { FeatureCollection } from "@/types/geojson";
import type { DatasetId, MapFeature } from "@/types/dataset";

type DatasetState =
  | { status: "ready"; features: readonly MapFeature[] }
  | { status: "error"; message: string };

export type DatasetsResult = {
  active: readonly DatasetId[];
  toggle: (id: DatasetId) => void;
  /** Features from every active dataset that has finished loading. */
  features: readonly MapFeature[];
  /** How many active datasets are still being fetched. */
  loadingCount: number;
  errors: readonly string[];
};

const EMPTY: readonly MapFeature[] = [];

const cache = new Map<DatasetId, Promise<readonly MapFeature[]>>();

function loadDataset(id: DatasetId): Promise<readonly MapFeature[]> {
  const cached = cache.get(id);
  if (cached) return cached;

  const info = getDataset(id);

  const request = fetch(info.file)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Gagal memuat ${info.label} (${response.status})`);
      }
      const collection =
        (await response.json()) as FeatureCollection<MapFeature>;
      return collection.features;
    })
    .catch((error: unknown) => {
      // Drop the failed promise so a later toggle can try again.
      cache.delete(id);
      throw error;
    });

  cache.set(id, request);
  return request;
}

export function useDatasets(): DatasetsResult {
  const [active, setActive] = useState<readonly DatasetId[]>(
    DEFAULT_ACTIVE_DATASETS,
  );
  const [states, setStates] = useState<
    Partial<Record<DatasetId, DatasetState>>
  >({});

  useEffect(() => {
    let live = true;

    for (const id of active) {
      void loadDataset(id)
        .then((features) => {
          if (!live) return;
          setStates((current) => {
            const known = current[id];
            // Returning the same object tells React nothing changed, so
            // toggling another category does not rebuild this one's markers.
            if (known?.status === "ready" && known.features === features) {
              return current;
            }
            return { ...current, [id]: { status: "ready", features } };
          });
        })
        .catch((error: unknown) => {
          if (!live) return;
          const message =
            error instanceof Error
              ? error.message
              : `Data ${getDataset(id).label} tidak dapat dibaca`;
          setStates((current) => ({
            ...current,
            [id]: { status: "error", message },
          }));
        });
    }

    return () => {
      live = false;
    };
  }, [active]);

  const toggle = useCallback((id: DatasetId) => {
    setActive((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }, []);

  const features = useMemo(() => {
    const collected: MapFeature[] = [];
    for (const id of active) {
      const state = states[id];
      if (state?.status === "ready") collected.push(...state.features);
    }
    return collected.length > 0 ? collected : EMPTY;
  }, [active, states]);

  const loadingCount = active.filter((id) => states[id] === undefined).length;

  const errors = active
    .map((id) => states[id])
    .filter(
      (state): state is { status: "error"; message: string } =>
        state?.status === "error",
    )
    .map((state) => state.message);

  return { active, toggle, features, loadingCount, errors };
}
