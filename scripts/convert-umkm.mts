/*
  Converts the Kobo xlsx export into a published GeoJSON file.

  Run it with:  npm run convert:umkm
  Input:        data/raw/umkm.xlsx   (gitignored, contains personal data)
  Output:       public/data/umkm.geojson

  The output is rewritten from scratch on every run, so deletions and
  corrections made in Kobo reach the map instead of lingering forever.
*/
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";

import {
  KOBO_CATEGORY_TO_SLUG,
  PADUKUHAN_LABELS,
  PRODUCT_LABELS,
} from "../src/lib/umkm-mapping.js";
import { UMKM_CATEGORY_LABELS } from "../src/types/umkm.js";

const SOURCE_FILE = path.resolve("data/raw/umkm.xlsx");
const OUTPUT_FILE = path.resolve("public/data/umkm.geojson");
const PHOTO_BASE = "/photos/umkm";
const PHOTO_FIELDS = ["depan", "samping", "lainnya"] as const;

/** Six decimals is about 11 cm on the ground, far beyond GPS accuracy. */
const COORDINATE_DECIMALS = 6;
/** Points less accurate than this are reported for manual rechecking. */
const PRECISION_WARNING_METRES = 20;

type Row = Record<string, string>;

function readCell(cell: ExcelJS.Cell): string {
  const value = cell.value;
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "text" in value) {
    return String(value.text).trim();
  }
  if (typeof value === "object" && "result" in value) {
    return String(value.result ?? "").trim();
  }
  return String(value).trim();
}

async function readRows(file: string): Promise<Row[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(file);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    throw new Error("File tidak berisi sheet apa pun.");
  }

  const headers: string[] = [];
  sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, index) => {
    headers[index] = readCell(cell);
  });

  const rows: Row[] = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const entry: Row = {};
    row.eachCell({ includeEmpty: true }, (cell, index) => {
      const key = headers[index];
      if (key) entry[key] = readCell(cell);
    });
    rows.push(entry);
  });

  return rows;
}

/**
 * Surveyors sometimes type a placeholder instead of leaving a field
 * empty, so a lone dash or underscore counts as blank.
 */
function cleanText(raw: string | undefined): string | null {
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
function normalisePhone(raw: string | undefined): string | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length < 8) return null;
  if (digits.startsWith("62")) return "0" + digits.slice(2);
  if (digits.startsWith("0")) return digits;
  return "0" + digits;
}

function round(value: number): number {
  const factor = 10 ** COORDINATE_DECIMALS;
  return Math.round(value * factor) / factor;
}

function resolveProducts(row: Row, id: string): string[] {
  const codes = [row["produk"], row["komoditas"]]
    .filter(Boolean)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean);

  const products: string[] = [];
  for (const code of codes) {
    const label = PRODUCT_LABELS[code];
    if (!label) {
      throw new Error(
        `Kode produk tidak dikenal: "${code}" pada submission ${id}`,
      );
    }
    // The "lainnya" option is replaced by whatever was typed in produk_lain.
    if (label === "Lainnya") continue;
    if (!products.includes(label)) products.push(label);
  }

  const typed = cleanText(row["produk_lain"]);
  if (typed) {
    for (const piece of typed
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)) {
      if (!products.includes(piece)) products.push(piece);
    }
  }

  return products;
}

async function main() {
  const rows = await readRows(SOURCE_FILE);

  const features = [];
  const skipped: string[] = [];
  const warnings: string[] = [];

  for (const row of rows) {
    const id = row["_id"] ?? "";
    const latitude = Number(row["_koordinat_latitude"]);
    const longitude = Number(row["_koordinat_longitude"]);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      skipped.push(`${id}: koordinat kosong atau bukan angka`);
      continue;
    }
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      skipped.push(`${id}: koordinat di luar rentang yang sah`);
      continue;
    }

    const categoryCode = row["kategori"] ?? "";
    const category = KOBO_CATEGORY_TO_SLUG[categoryCode];
    if (!category) {
      throw new Error(
        `Kategori tidak dikenal: "${categoryCode}" pada submission ${id}. ` +
          `Tambahkan ke KOBO_CATEGORY_TO_SLUG.`,
      );
    }

    const padukuhanCode = row["padukuhan"] ?? "";
    const padukuhan = PADUKUHAN_LABELS[padukuhanCode];
    if (!padukuhan) {
      throw new Error(
        `Kode padukuhan tidak dikenal: "${padukuhanCode}" pada submission ${id}. ` +
          `Tambahkan ke PADUKUHAN_LABELS.`,
      );
    }

    const precision = Number(row["_koordinat_precision"]);
    if (Number.isFinite(precision) && precision > PRECISION_WARNING_METRES) {
      warnings.push(
        `${id}: akurasi GPS ${precision.toFixed(1)} m, perlu dicek ulang`,
      );
    }

    // Photo paths point at the local copies the photo pipeline produces.
    const photos = PHOTO_FIELDS.filter((field) => row[`foto_${field}_URL`]).map(
      (field) => `${PHOTO_BASE}/${id}-${field}.webp`,
    );

    const isHalalCertified = row["halal"] === "sudah";
    const typedCategory = cleanText(row["kategori_lain"]);

    features.push({
      type: "Feature",
      id: String(id),
      geometry: {
        type: "Point",
        coordinates: [round(longitude), round(latitude)],
      },
      properties: {
        category,
        categoryLabel:
          category === "lainnya"
            ? (typedCategory ?? UMKM_CATEGORY_LABELS.lainnya)
            : UMKM_CATEGORY_LABELS[category],
        name: cleanText(row["nama_usaha"]) ?? "Tanpa nama",
        ownerName: cleanText(row["nama_pemilik"]),
        products: resolveProducts(row, String(id)),
        padukuhan,
        rt: cleanText(row["rt"]) ?? "",
        rw: cleanText(row["rw"]) ?? "",
        detail: cleanText(row["detail_usaha"]),
        // Consent is explicit: anything other than "ya" drops the number.
        phone: row["hp_tampil"] === "ya" ? normalisePhone(row["no_hp"]) : null,
        pirtNumber: cleanText(row["no_pirt"]),
        halalCertified: isHalalCertified,
        halalNumber: isHalalCertified ? cleanText(row["no_halal"]) : null,
        photos,
        gpsPrecision: Number.isFinite(precision) ? precision : null,
      },
    });
  }

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(
    OUTPUT_FILE,
    JSON.stringify({ type: "FeatureCollection", features }),
  );

  console.log("");
  console.log(`Terbaca    : ${rows.length} baris`);
  console.log(`Ditulis    : ${features.length} titik`);
  console.log(`Dilewati   : ${skipped.length}`);
  for (const line of skipped) console.log(`   - ${line}`);
  console.log(`Perlu dicek: ${warnings.length}`);
  for (const line of warnings) console.log(`   - ${line}`);
  console.log("");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Konversi gagal:", message);
  process.exit(1);
});
