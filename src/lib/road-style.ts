import { readCssVariable } from "./css-variables";

/** One road condition as the form records it and the map draws it. */
export type RoadCondition = {
  /** Code written by the converter into properties.variant. */
  readonly code: string;
  readonly label: string;
  /** CSS variable in globals.css holding the line colour. */
  readonly colorVariable: string;
  /**
   * Canvas dash pattern, or null for a solid line. The worst condition is
   * dashed so it still stands apart for people who cannot tell red from
   * orange, which is not something colour alone can promise.
   */
  readonly dashArray: string | null;
};

/** Ordered best to worst, which is also the order the legend reads in. */
export const ROAD_CONDITIONS: readonly RoadCondition[] = [
  {
    code: "baik",
    label: "Baik",
    colorVariable: "--condition-baik",
    dashArray: null,
  },
  {
    code: "sedang",
    label: "Sedang",
    colorVariable: "--condition-sedang",
    dashArray: null,
  },
  {
    code: "rusak_ringan",
    label: "Rusak ringan",
    colorVariable: "--condition-rusak-ringan",
    dashArray: null,
  },
  {
    code: "rusak_berat",
    label: "Rusak berat",
    colorVariable: "--condition-rusak-berat",
    dashArray: "8 6",
  },
];

/** Used for a road whose condition code is missing or not in the list. */
const UNKNOWN_COLOR_VARIABLE = "--ink-muted";

const BY_CODE = new Map(ROAD_CONDITIONS.map((item) => [item.code, item]));

/** getComputedStyle forces a style recalculation, so each variable is read once. */
const colorCache = new Map<string, string>();

function resolveColor(variable: string): string {
  const cached = colorCache.get(variable);
  if (cached) return cached;

  const resolved = readCssVariable(variable);
  colorCache.set(variable, resolved);
  return resolved;
}

export type RoadStyle = {
  readonly color: string;
  readonly dashArray: string | null;
};

/**
 * Line style for one road segment, from its condition code.
 *
 * Canvas cannot resolve var(), so the colour is read out of CSS here.
 * The colour values themselves still live only in globals.css.
 */
export function getRoadStyle(variant: string | null | undefined): RoadStyle {
  const condition = variant ? BY_CODE.get(variant) : undefined;

  return {
    color: resolveColor(condition?.colorVariable ?? UNKNOWN_COLOR_VARIABLE),
    dashArray: condition?.dashArray ?? null,
  };
}
