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

import type { DetailItem, PointProperties } from "../src/types/dataset.ts";
import type {
  LineStringGeometry,
  PointGeometry,
} from "../src/types/geojson.ts";
import { PADUKUHAN_LABELS } from "../src/lib/padukuhan.ts";
import { DATASETS, type DatasetConfig } from "./kobo/datasets.mts";
import { cleanText, normalisePhone, resolveField } from "./kobo/field.mts";
import { formatLength, parseTrace, roundTo } from "./kobo/geometry.mts";
import { readRows, type Row } from "./kobo/xlsx.mts";

const OUTPUT_DIR = path.resolve("public/data");

/** Six decimals is about 11 cm on the ground, far beyond GPS accuracy. */
const COORDINATE_DECIMALS = 6;
/** Features less accurate than this are reported for manual rechecking. */
const PRECISION_WARNING_METRES = 20;
/** A line shorter than this cannot be drawn in any useful way. */
const MIN_LINE_METRES = 1;
/** Status Kobo assigns when a reviewer rejects a submission. */
const HIDDEN_VALIDATION_STATUS = "validation_status_not_approved";

/** The shape of one published feature, tied to the types the app reads. */
type BuiltFeature = {
  type: "Feature";
  id: string;
  geometry: PointGeometry | LineStringGeometry;
  properties: PointProperties;
};

type Shape =
  | {
      ok: true;
      geometry: PointGeometry | LineStringGeometry;
      precision: number | null;
      /** Length measured along the geometry, null for points. */
      measuredLength: number | null;
    }
  | { ok: false; reason: string };

/** Number("") is 0, so blank cells have to be ruled out before parsing. */
function readNumber(text: string | undefined): number | null {
  if (text === undefined || text.trim() === "") return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

function readShape(config: DatasetConfig, row: Row): Shape {
  const source = config.geometry ?? { kind: "point" as const };

  if (source.kind === "line") {
    const trace = parseTrace(row[source.column] ?? "", COORDINATE_DECIMALS);
    if (!trace.ok) return { ok: false, reason: trace.reason };

    if (trace.lengthMetres < MIN_LINE_METRES) {
      return { ok: false, reason: "garis terlalu pendek untuk digambar" };
    }

    return {
      ok: true,
      geometry: { type: "LineString", coordinates: trace.coordinates },
      precision: trace.worstAccuracy,
      measuredLength: trace.lengthMetres,
    };
  }

  const latitude = readNumber(row["_koordinat_latitude"]);
  const longitude = readNumber(row["_koordinat_longitude"]);

  if (latitude === null || longitude === null) {
    return { ok: false, reason: "koordinat kosong atau bukan angka" };
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return { ok: false, reason: "koordinat di luar rentang yang sah" };
  }

  return {
    ok: true,
    geometry: {
      type: "Point",
      coordinates: [
        roundTo(longitude, COORDINATE_DECIMALS),
        roundTo(latitude, COORDINATE_DECIMALS),
      ],
    },
    precision: readNumber(row["_koordinat_precision"]),
    measuredLength: null,
  };
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

/**
 * The code that decides how a feature is drawn, for example a road's
 * condition. An unknown code stops the run, like any other unknown code.
 */
function readVariant(
  config: DatasetConfig,
  row: Row,
  context: string,
): string | null {
  if (!config.variant) return null;

  const code = cleanText(row[config.variant.column]);
  if (!code) return null;

  if (config.variant.labels[code] === undefined) {
    throw new Error(
      `Nilai tidak dikenal "${code}" pada kolom ${config.variant.column} (${context}). ` +
        `Tambahkan ke tabel label di datasets.mts.`,
    );
  }
  return code;
}

/**
 * Both lengths are published and labelled, because they often disagree:
 * the measured one follows the drawn line, the other is whatever the
 * surveyor typed into the form.
 */
function buildLengthDetails(
  config: DatasetConfig,
  row: Row,
  measuredMetres: number | null,
): DetailItem[] {
  const items: DetailItem[] = [];

  if (measuredMetres !== null) {
    items.push({
      label: "Panjang (dihitung dari garis)",
      value: formatLength(measuredMetres),
    });
  }

  const source = config.geometry;
  if (source?.kind === "line" && source.reportedLengthColumn) {
    const reported = readNumber(row[source.reportedLengthColumn]);
    if (reported !== null && reported > 0) {
      items.push({
        label: "Panjang (ketikan surveyor)",
        value: formatLength(reported),
      });
    }
  }

  return items;
}

type Report = {
  config: DatasetConfig;
  total: number;
  written: number;
  hidden: string[];
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

  const features: BuiltFeature[] = [];
  const hidden: string[] = [];
  const skipped: string[] = [];
  const warnings: string[] = [];

  for (const row of rows) {
    const id = row["_id"] ?? "";
    const context = config.id + " " + id;

    // A rejected submission stays in Kobo but never reaches the map.
    if (row["_validation_status"] === HIDDEN_VALIDATION_STATUS) {
      hidden.push(id + ": berstatus not approved di Kobo");
      continue;
    }

    const shape = readShape(config, row);
    if (!shape.ok) {
      skipped.push(id + ": " + shape.reason);
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

    const details: DetailItem[] = [];
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

    details.push(...buildLengthDetails(config, row, shape.measuredLength));

    let phone: string | null = null;
    if (config.phone) {
      // Consent is explicit: anything other than "ya" drops the number.
      const consented = row[config.phone.consentColumn] === "ya";
      phone = consented ? normalisePhone(row[config.phone.column]) : null;
    }

    if (
      shape.precision !== null &&
      shape.precision > PRECISION_WARNING_METRES
    ) {
      warnings.push(id + ": akurasi GPS " + shape.precision.toFixed(1) + " m");
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
      geometry: shape.geometry,
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
        gpsPrecision: shape.precision,
        variant: readVariant(config, row, context),
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
    hidden,
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
        " data",
    );
    for (const line of report.hidden) console.log("   disembunyikan  " + line);
    for (const line of report.skipped) console.log("   dilewati       " + line);
    for (const line of report.warnings)
      console.log("   perlu cek      " + line);
  }
  console.log("");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Konversi gagal:", message);
  process.exit(1);
});
