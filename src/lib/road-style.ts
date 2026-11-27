import { readCssVariable } from "./css-variables";

// one road condition as the form records it and the map draws it
export type RoadCondition = {
  readonly code: string;
  readonly label: string;
  readonly colorVariable: string;
  readonly dashArray: string | null;
};

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

export function getRoadStyle(variant: string | null | undefined): RoadStyle {
  const condition = variant ? BY_CODE.get(variant) : undefined;

  return {
    color: resolveColor(condition?.colorVariable ?? UNKNOWN_COLOR_VARIABLE),
    dashArray: condition?.dashArray ?? null,
  };
}
