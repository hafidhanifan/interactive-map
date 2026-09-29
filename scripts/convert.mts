/*
  Converts every Kobo export into its published GeoJSON file.

  Run it with:  npm run convert
  One category:  npm run convert -- kebun

  Input:   data/raw/<folder>/<folder>.xlsx   (gitignored, holds personal data)
  Output:  public/data/<id>.geojson

  Files are rewritten from scratch on every run, so deletions and edits
  made in Kobo reach the map instead of lingering forever.
*/
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { PADUKUHAN_LABELS } from "../src/lib/padukuhan.js";
import { DATASETS, type DatasetConfig } from "./kobo/datasets.mts";
import { cleanText, normalisePhone, resolveField } from "./kobo/field.mjs";
import { readRows, type Row } from "./kobo/xlsx.mjs";

const OUTPUT_DIR = path.resolve("public/data");

/** Six decimals is about 11 cm on the ground, far beyond GPS accuracy. */
const COORDINATE_DECIMALS = 6;
/** Points less accurate than this are reported for manual rechecking. */
const PRECISION_WARNING_METRES = 20;

function round(value: number): number {
  const factor = 10 ** COORDINATE_DECIMALS;
  return Math.round(value * factor) / factor;
}

function buildAddress(row: Row, padukuhan: string | null): string | null {
  if (!padukuhan) return null;

  const rt = cleanText(row["rt"]);
  const rw = cleanText(row["rw"]);
  if (!rt && !rw) return "Padukuhan " + padukuhan;

  return (
    "Padukuhan " + padukuhan + ", RT " + (rt ?? "-") + " RW " + (rw ?? "-")
  );
}

type Report = {
  config: DatasetConfig;
  total: number;
  written: number;
  skipped: string[];
  warnings: string[];
};

async function convert(config: DatasetConfig): Promise<Report> {
  const source = path.resolve(
    "data/raw",
    config.folder,
    config.folder + ".xlsx",
  );
  const rows = await readRows(source);

  const features = [];
  const skipped: string[] = [];
  const warnings: string[] = [];

  for (const row of rows) {
    const id = row["_id"] ?? "";
    const context = config.id + " " + id;

    const latitude = Number(row["_koordinat_latitude"]);
    const longitude = Number(row["_koordinat_longitude"]);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      skipped.push(id + ": koordinat kosong atau bukan angka");
      continue;
    }
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      skipped.push(id + ": koordinat di luar rentang yang sah");
      continue;
    }

    const padukuhanCode = cleanText(row["padukuhan"]);
    let padukuhan: string | null = null;
    if (padukuhanCode) {
      padukuhan = PADUKUHAN_LABELS[padukuhanCode] ?? null;
      if (!padukuhan) {
        throw new Error(
          `Kode padukuhan tidak dikenal "${padukuhanCode}" (${context}).`,
        );
      }
    }

    const subtitleParts = config.subtitle
      ? resolveField(config.subtitle, row, context)
      : [];
    const facets = config.facet ? resolveField(config.facet, row, context) : [];

    const details = [];
    for (const spec of config.details) {
      const values = resolveField(spec, row, context);
      if (values.length > 0) {
        details.push({ label: spec.label, value: values.join(", ") });
      }
    }

    // The owner leads the list where a dataset publishes one at all.
    if (config.ownerColumn) {
      const owner = cleanText(row[config.ownerColumn]);
      if (owner) details.unshift({ label: "Pemilik", value: owner });
    }

    let phone: string | null = null;
    if (config.phone) {
      // Consent is explicit: anything other than "ya" drops the number.
      const consented = row[config.phone.consentColumn] === "ya";
      phone = consented ? normalisePhone(row[config.phone.column]) : null;
    }

    const precision = Number(row["_koordinat_precision"]);
    if (Number.isFinite(precision) && precision > PRECISION_WARNING_METRES) {
      warnings.push(id + ": akurasi GPS " + precision.toFixed(1) + " m");
    }

    // Photo paths point at the local copies the photo pipeline produces.
    const photos = config.photoFields
      .filter((field) => row["foto_" + field + "_URL"])
      .map(
        (field) => "/photos/" + config.id + "/" + id + "-" + field + ".webp",
      );

    const name = config.nameColumn
      ? (cleanText(row[config.nameColumn]) ?? config.label)
      : config.label;

    features.push({
      type: "Feature",
      id: String(id),
      geometry: {
        type: "Point",
        coordinates: [round(longitude), round(latitude)],
      },
      properties: {
        dataset: config.id,
        name,
        subtitle: subtitleParts.length > 0 ? subtitleParts.join(", ") : null,
        padukuhan,
        address: config.includeAddress ? buildAddress(row, padukuhan) : null,
        facets,
        details,
        phone,
        photos,
        gpsPrecision: Number.isFinite(precision) ? precision : null,
      },
    });
  }

  const output = path.join(OUTPUT_DIR, config.id + ".geojson");
  await writeFile(
    output,
    JSON.stringify({ type: "FeatureCollection", features }),
  );

  return {
    config,
    total: rows.length,
    written: features.length,
    skipped,
    warnings,
  };
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const only = process.argv[2];
  const targets = only ? DATASETS.filter((item) => item.id === only) : DATASETS;

  if (targets.length === 0) {
    throw new Error("Kategori tidak dikenal: " + only);
  }

  console.log("");
  for (const config of targets) {
    const report = await convert(config);
    console.log(
      report.config.label.padEnd(32) +
        report.written +
        " / " +
        report.total +
        " titik",
    );
    for (const line of report.skipped) console.log("   dilewati   " + line);
    for (const line of report.warnings) console.log("   perlu cek  " + line);
  }
  console.log("");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Konversi gagal:", message);
  process.exit(1);
});
