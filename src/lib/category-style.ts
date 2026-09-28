import type { UmkmCategory } from "@/types/umkm";
import { readCssVariable } from "./css-variables";

/**
 * maps each category to the CSS variable holding its colour
 * the values themselves stay in globals.css
 */

const CATEGORY_COLOR_VARIABLES: Record<UmkmCategory, string> = {
  "toko-kelontong": "--category-umkm",
  kuliner: "--category-umkm",
  "rumah-produksi": "--category-umkm",
  jasa: "--category-umkm",
  "pengepul-hasil-kebun": "--category-umkm",
  bengkel: "--category-umkm",
  konter: "--category-umkm",
  lainnya: "--category-umkm",
};

const colorCache = new Map<UmkmCategory, string>();

export function getCategoryColor(category: UmkmCategory): string {
  const cached = colorCache.get(category);
  if (cached) return cached;

  const resolved = readCssVariable(CATEGORY_COLOR_VARIABLES[category]);
  colorCache.set(category, resolved);
  return resolved;
}
