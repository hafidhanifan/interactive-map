"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";

import { getDataset } from "@/lib/datasets";
import type { DatasetId, MapPoint } from "@/types/dataset";

export type FacetOption = {
  value: string;
  label: string;
  count: number;
};

export type FacetGroup = {
  dataset: DatasetId;
  title: string;
  options: readonly FacetOption[];
};

export type PointFilterResult = {
  query: string;
  setQuery: (next: string) => void;
  selectedFacets: readonly string[];
  toggleFacet: (value: string) => void;
  selectedPadukuhan: readonly string[];
  togglePadukuhan: (value: string) => void;
  reset: () => void;
  activeCount: number;
  hasActiveFilter: boolean;
  facetGroups: readonly FacetGroup[];
  padukuhanOptions: readonly FacetOption[];
  filtered: readonly MapPoint[];
};

function toggleValue(
  current: readonly string[],
  value: string,
): readonly string[] {
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
}

function countBy(
  features: readonly MapPoint[],
  pick: (point: MapPoint) => readonly string[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const feature of features) {
    for (const value of pick(feature)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return counts;
}

/**
 * search and filter state for whatever categories are currently loaded.
 *
 * counts come from the loaded set rather than the filtered result, so
 * the numbers beside each option stay stable while the user is choosing.
 */
export function usePointFilter(
  features: readonly MapPoint[],
  activeDatasets: readonly DatasetId[],
): PointFilterResult {
  const [query, setQuery] = useState("");
  const [selectedFacets, setSelectedFacets] = useState<readonly string[]>([]);
  const [selectedPadukuhan, setSelectedPadukuhan] = useState<readonly string[]>(
    [],
  );

  /*
    the typed value updates the input immediately, while this deferred
    copy is what the map filters on. React lets the keystroke paint first
    and redraws the markers once it has room, so typing never stutters.
  */
  const deferredQuery = useDeferredValue(query);

  const toggleFacet = useCallback((value: string) => {
    setSelectedFacets((current) => toggleValue(current, value));
  }, []);

  const togglePadukuhan = useCallback((value: string) => {
    setSelectedPadukuhan((current) => toggleValue(current, value));
  }, []);

  const reset = useCallback(() => {
    setQuery("");
    setSelectedFacets([]);
    setSelectedPadukuhan([]);
  }, []);

  /*
    built once per data change rather than once per keystroke: joining
    every field of every point is the expensive part of searching, and
    it does not depend on what was typed.
  */
  const searchIndex = useMemo(() => {
    const index = new Map<string, string>();
    for (const feature of features) {
      const { properties } = feature;
      index.set(
        feature.id,
        [
          properties.name,
          properties.subtitle ?? "",
          properties.padukuhan ?? "",
          properties.facets.join(" "),
          properties.details.map((item) => item.value).join(" "),
        ]
          .join(" ")
          .toLowerCase(),
      );
    }
    return index;
  }, [features]);

  const facetGroups = useMemo(() => {
    const groups: FacetGroup[] = [];

    for (const id of activeDatasets) {
      const info = getDataset(id);
      if (!info.facetTitle) continue;

      const ofDataset = features.filter(
        (feature) => feature.properties.dataset === id,
      );
      const counts = countBy(ofDataset, (point) => point.properties.facets);
      if (counts.size === 0) continue;

      groups.push({
        dataset: id,
        title: info.facetTitle + " - " + info.shortLabel,
        options: [...counts.entries()]
          .map(([value, count]) => ({ value, label: value, count }))
          .sort((a, b) => b.count - a.count),
      });
    }

    return groups;
  }, [features, activeDatasets]);

  const padukuhanOptions = useMemo(() => {
    const counts = countBy(features, (point) =>
      point.properties.padukuhan ? [point.properties.padukuhan] : [],
    );

    return [...counts.entries()]
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => a.label.localeCompare(b.label, "id"));
  }, [features]);

  const filtered = useMemo(() => {
    const needle = deferredQuery.toLowerCase().trim();

    return features.filter((feature) => {
      const { properties } = feature;

      if (
        selectedFacets.length > 0 &&
        !properties.facets.some((value) => selectedFacets.includes(value))
      ) {
        return false;
      }

      if (
        selectedPadukuhan.length > 0 &&
        (properties.padukuhan === null ||
          !selectedPadukuhan.includes(properties.padukuhan))
      ) {
        return false;
      }

      if (needle === "") return true;
      return (searchIndex.get(feature.id) ?? "").includes(needle);
    });
  }, [features, searchIndex, deferredQuery, selectedFacets, selectedPadukuhan]);

  const activeCount = selectedFacets.length + selectedPadukuhan.length;

  return {
    query,
    setQuery,
    selectedFacets,
    toggleFacet,
    selectedPadukuhan,
    togglePadukuhan,
    reset,
    activeCount,
    hasActiveFilter: query !== "" || activeCount > 0,
    facetGroups,
    padukuhanOptions,
    filtered,
  };
}
