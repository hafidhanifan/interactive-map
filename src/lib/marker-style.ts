import { readCssVariable } from "./css-variables";
import { getDataset } from "./datasets";
import type { DatasetId } from "@/types/dataset";

const colorCache = new Map<DatasetId, string>();

export function getDatasetColor(dataset: DatasetId): string {
  const cached = colorCache.get(dataset);
  if (cached) return cached;

  const resolved = readCssVariable(getDataset(dataset).colorVariable);
  colorCache.set(dataset, resolved);
  return resolved;
}
