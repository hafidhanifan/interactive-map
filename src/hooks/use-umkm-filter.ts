"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";

import { UMKM_CATEGORY_LABELS } from "@/types/umkm";
import type { UmkmCategory, UmkmFeature } from "@/types/umkm";

export type FacetOption = {
  value: string;
  label: string;
  count: number;
};

export type UmkmFilterResult = {
  query: string;
  setQuery: (next: string) => void;
  selectedCategories: readonly string[];
  toggleCategory: (value: string) => void;
  selectedPadukuhan: readonly string[];
  togglePadukuhan: (value: string) => void;
  reset: () => void;
  hasActiveFilter: boolean;
  categoryOptions: readonly FacetOption[];
  padukuhanOptions: readonly FacetOption[];
  filtered: readonly UmkmFeature[];
};

function normalise(value: string): string {
  return value.toLowerCase().trim();
}

function toggleValue(
  current: readonly string[],
  value: string,
): readonly string[] {
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
}

// search and filter state for the UMKM layer.
export function useUmkmFilter(
  features: readonly UmkmFeature[],
): UmkmFilterResult {
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<
    readonly string[]
  >([]);
  const [selectedPadukuhan, setSelectedPadukuhan] = useState<readonly string[]>(
    [],
  );

  const deferredQuery = useDeferredValue(query);

  const toggleCategory = useCallback((value: string) => {
    setSelectedCategories((current) => toggleValue(current, value));
  }, []);

  const togglePadukuhan = useCallback((value: string) => {
    setSelectedPadukuhan((current) => toggleValue(current, value));
  }, []);

  const reset = useCallback(() => {
    setQuery("");
    setSelectedCategories([]);
    setSelectedPadukuhan([]);
  }, []);

  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const feature of features) {
      const key = feature.properties.category;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return [...counts.entries()]
      .map(([value, count]) => ({
        value,
        label: UMKM_CATEGORY_LABELS[value as UmkmCategory] ?? value,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [features]);

  const padukuhanOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const feature of features) {
      const key = feature.properties.padukuhan;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return [...counts.entries()]
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => a.label.localeCompare(b.label, "id"));
  }, [features]);

  const filtered = useMemo(() => {
    const needle = normalise(deferredQuery);

    return features.filter((feature) => {
      const { properties } = feature;

      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(properties.category)
      ) {
        return false;
      }

      if (
        selectedPadukuhan.length > 0 &&
        !selectedPadukuhan.includes(properties.padukuhan)
      ) {
        return false;
      }

      if (needle === "") return true;

      const haystack = [
        properties.name,
        properties.ownerName ?? "",
        properties.categoryLabel,
        properties.products.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [features, deferredQuery, selectedCategories, selectedPadukuhan]);

  const hasActiveFilter =
    query !== "" ||
    selectedCategories.length > 0 ||
    selectedPadukuhan.length > 0;

  return {
    query,
    setQuery,
    selectedCategories,
    toggleCategory,
    selectedPadukuhan,
    togglePadukuhan,
    reset,
    hasActiveFilter,
    categoryOptions,
    padukuhanOptions,
    filtered,
  };
}
