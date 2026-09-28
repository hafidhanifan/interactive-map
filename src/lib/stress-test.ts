import type { UmkmFeature } from "@/types/umkm";

/**
 * Development only: multiplies the dataset so clustering can be judged
 * against a realistic point count before the real survey is finished.
 *
 * Copies are nudged apart by a deterministic offset rather than a random
 * one, so the same URL always produces the same picture.
 */
export function multiplyFeatures(
  features: readonly UmkmFeature[],
  factor: number,
): readonly UmkmFeature[] {
  if (factor <= 1) return features;

  const result: UmkmFeature[] = [];

  for (let copy = 0; copy < factor; copy += 1) {
    for (const feature of features) {
      if (copy === 0) {
        result.push(feature);
        continue;
      }

      const [longitude, latitude] = feature.geometry.coordinates;
      // Spread copies over roughly a 500 metre square around the original.
      const angle = (copy * 137.5 * Math.PI) / 180;
      const distance = 0.0005 * Math.sqrt(copy);

      result.push({
        ...feature,
        id: `${feature.id}-c${copy}`,
        geometry: {
          type: "Point",
          coordinates: [
            longitude + Math.cos(angle) * distance,
            latitude + Math.sin(angle) * distance,
          ],
        },
      });
    }
  }

  return result;
}

/**
 * Reads the stress factor from the URL, for example ?stress=50.
 * Returns 1 when absent, which leaves the data untouched.
 */
export function readStressFactor(): number {
  if (typeof window === "undefined") return 1;

  const raw = new URLSearchParams(window.location.search).get("stress");
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.min(parsed, 200);
}
