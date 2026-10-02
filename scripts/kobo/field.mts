import type { Row } from "./xlsx.mts";

/**
 * How one column becomes display text.
 *
 * kind "text"   takes the cell as written
 * kind "choice" maps a single code through labels
 * kind "multi"  splits on spaces and maps each code
 */
export type FieldSpec = {
  label: string;
  column: string;
  kind?: "text" | "choice" | "multi";
  labels?: Record<string, string>;
  /** Column holding what the surveyor typed after choosing "lainnya". */
  otherColumn?: string;
  /**
   * Older column to fall back on when the current one is empty.
   *
   * Forms change while a survey is running, and a renamed question
   * leaves both generations side by side in the same export.
   */
  fallback?: {
    column: string;
    kind?: "text" | "choice" | "multi";
    labels?: Record<string, string>;
  };
  /** Appended to the value, for example " pohon". */
  suffix?: string;
  /** Prepended when another column says so, for example "sekitar ". */
  prefixWhen?: {
    column: string;
    equals: string;
    prefix: string;
  };
};

/** Surveyors sometimes type a placeholder instead of leaving a field empty. */
export function cleanText(raw: string | undefined): string | null {
  const value = (raw ?? "").trim();
  if (value === "" || value === "-" || value === "_" || value === "--") {
    return null;
  }
  return value;
}

/**
 * Excel reads phone numbers as numbers, which drops the leading zero.
 * This puts it back and normalises the 62 country prefix.
 */
export function normalisePhone(raw: string | undefined): string | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length < 8) return null;
  if (digits.startsWith("62")) return "0" + digits.slice(2);
  if (digits.startsWith("0")) return digits;
  return "0" + digits;
}

type ResolveSource = {
  column: string;
  kind?: "text" | "choice" | "multi";
  labels?: Record<string, string>;
  otherColumn?: string;
};

/**
 * Turns one column into display strings.
 *
 * An unknown code throws rather than being skipped: it means the form
 * gained an option the mapping has not caught up with, and letting it
 * through would publish points with silently missing information.
 */
function resolveSource(
  source: ResolveSource,
  row: Row,
  context: string,
): string[] {
  const raw = cleanText(row[source.column]);
  const typed = source.otherColumn ? cleanText(row[source.otherColumn]) : null;
  const kind = source.kind ?? "text";

  if (kind === "text") {
    return raw ? [raw] : [];
  }

  if (!raw) return typed ? [typed] : [];

  const codes = kind === "multi" ? raw.split(/\s+/).filter(Boolean) : [raw];
  const resolved: string[] = [];

  for (const code of codes) {
    const label = source.labels?.[code];
    if (!label) {
      throw new Error(
        `Nilai tidak dikenal "${code}" pada kolom ${source.column} (${context}). ` +
          `Tambahkan ke tabel label di datasets.mts.`,
      );
    }
    // OTHER is a placeholder: the real text comes from otherColumn below.
    if (label === "__other__") continue;
    if (!resolved.includes(label)) resolved.push(label);
  }

  if (typed) {
    for (const piece of typed
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)) {
      if (!resolved.includes(piece)) resolved.push(piece);
    }
  }

  return resolved;
}

/** Resolves one field into the display strings it contributes. */
export function resolveField(
  spec: FieldSpec,
  row: Row,
  context: string,
): string[] {
  let values = resolveSource(spec, row, context);

  // Nothing in the current column means this record predates a rename.
  if (values.length === 0 && spec.fallback) {
    values = resolveSource(spec.fallback, row, context);
  }

  if (values.length === 0) return [];

  if (spec.suffix) {
    values = values.map((value) => value + spec.suffix);
  }

  if (
    spec.prefixWhen &&
    row[spec.prefixWhen.column] === spec.prefixWhen.equals
  ) {
    values = values.map((value) => spec.prefixWhen!.prefix + value);
  }

  return values;
}
