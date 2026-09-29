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

/**
 * Resolves one field into the display strings it contributes.
 *
 * An unknown code throws rather than being skipped: it means the form
 * gained an option the mapping has not caught up with, and letting it
 * through would publish points with silently missing information.
 */
export function resolveField(
  spec: FieldSpec,
  row: Row,
  context: string,
): string[] {
  const raw = cleanText(row[spec.column]);
  const typed = spec.otherColumn ? cleanText(row[spec.otherColumn]) : null;
  const kind = spec.kind ?? "text";

  if (kind === "text") {
    return raw ? [raw] : [];
  }

  if (!raw) return typed ? [typed] : [];

  const codes = kind === "multi" ? raw.split(/\s+/).filter(Boolean) : [raw];
  const resolved: string[] = [];

  for (const code of codes) {
    const label = spec.labels?.[code];
    if (!label) {
      throw new Error(
        `Nilai tidak dikenal "${code}" pada kolom ${spec.column} (${context}). ` +
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
