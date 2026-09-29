"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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
  /** Points from every active dataset that has finished loading. */
  features: readonly MapPoint[];
  /** How many active datasets are still being fetched. */
  loadingCount: number;
  errors: readonly string[];
};

const EMPTY: readonly MapPoint[] = [];

/*
  Lives outside the component, so it survives remounts and is shared by
  every instance. Storing the promise rather than a flag is what makes
  this safe: a second caller awaits the same request instead of being
  turned away while the first one is still in flight.
*/
const cache = new Map<DatasetId, Promise<readonly MapPoint[]>>();

function loadDataset(id: DatasetId): Promise<readonly MapPoint[]> {
  const cached = cache.get(id);
  if (cached) return cached;

  const info = getDataset(id);

  const request = fetch(info.file)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Gagal memuat ${info.label} (${response.status})`);
      }
      const collection = (await response.json()) as FeatureCollection<MapPoint>;
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

/**
 * Loads category files on demand and keeps what it has fetched.
 *
 * A file is only requested the first time its category is switched on,
 * which is what keeps the initial page light once every category holds
 * thousands of points. Switching a category off leaves the data in
 * memory, so turning it back on costs nothing.
 */
export function useDatasets(): DatasetsResult {
  const [active, setActive] = useState<readonly DatasetId[]>(
    DEFAULT_ACTIVE_DATASETS,
  );
  const [states, setStates] = useState<Record<string, DatasetState>>({});

  useEffect(() => {
    /*
      Only guards against writing state after this effect is torn down.
      The request itself is never cancelled, because React runs effects
      twice in development and cancelling would leave the second run
      waiting on a request that had already been aborted.
    */
    let live = true;

    for (const id of active) {
      setStates((current) =>
        current[id] ? current : { ...current, [id]: { status: "loading" } },
      );

      void loadDataset(id)
        .then((features) => {
          if (!live) return;
          setStates((current) => ({
            ...current,
            [id]: { status: "ready", features },
          }));
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
