/*
  Turns the raw Kobo attachments into web ready photos.

  Run it with:  npm run photos:umkm
  Input:        data/raw/umkm/export.xlsx and data/raw/umkm/media/<uuid>/
  Output:       public/photos/umkm/<_id>-<field>.webp

  Output names must match the paths written by convert-umkm.mts, which
  builds them as /photos/umkm/<_id>-<field>.webp.

  Already converted files are left alone, so a rerun after new survey
  data only processes what is actually new.
*/
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";
import sharp from "sharp";

const SOURCE_FILE = path.resolve("data/raw/umkm/umkm.xlsx");
const MEDIA_DIR = path.resolve("data/raw/umkm/media");
const OUTPUT_DIR = path.resolve("public/photos/umkm");

const PHOTO_FIELDS = ["depan", "samping", "lainnya"] as const;

/** Long edge in pixels. Still sharp on a phone opened full screen. */
const MAX_EDGE_PIXELS = 1200;
/** WebP quality. Below about 65 the compression starts to show. */
const WEBP_QUALITY = 72;

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

async function exists(file: string): Promise<boolean> {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

/**
 * Finds the attachment on disk.
 *
 * Falls back to a case insensitive match because the sheet and the
 * downloaded folder do not always agree on extension casing, and that
 * difference is invisible on Windows but fatal once deployed on Linux.
 */
async function resolveFile(
  dir: string,
  wanted: string,
): Promise<string | null> {
  const direct = path.join(dir, wanted);
  if (await exists(direct)) return direct;

  try {
    const entries = await readdir(dir);
    const match = entries.find(
      (entry) => entry.toLowerCase() === wanted.toLowerCase(),
    );
    return match ? path.join(dir, match) : null;
  } catch {
    return null;
  }
}

async function main() {
  const rows = await readRows(SOURCE_FILE);
  await mkdir(OUTPUT_DIR, { recursive: true });

  let converted = 0;
  let reused = 0;
  let bytesIn = 0;
  let bytesOut = 0;
  const missing: string[] = [];
  const failed: string[] = [];

  for (const row of rows) {
    const id = row["_id"];
    if (!id) continue;

    /*
      Attachment folders are named after the submission's root uuid,
      which stays fixed. The _uuid column changes whenever a submission
      is edited, so matching on it misses every edited record.
      rootUuid arrives prefixed with "uuid:", which has to come off.
    */
    const rootUuid = (row["meta/rootUuid"] ?? "").replace(/^uuid:/, "");
    const uuid = rootUuid || row["_uuid"];
    if (!uuid) continue;

    const submissionDir = path.join(MEDIA_DIR, uuid);

    for (const field of PHOTO_FIELDS) {
      const fileName = row[`foto_${field}`];
      if (!fileName) continue;

      const output = path.join(OUTPUT_DIR, `${id}-${field}.webp`);
      if (await exists(output)) {
        reused += 1;
        continue;
      }

      const input = await resolveFile(submissionDir, fileName);
      if (!input) {
        missing.push(`${id} (${field}): ${fileName}`);
        continue;
      }

      try {
        const before = await stat(input);

        await sharp(input)
          // Applies the orientation stored in EXIF, so portrait photos
          // do not show up sideways in browsers that ignore the tag.
          .rotate()
          .resize({
            width: MAX_EDGE_PIXELS,
            height: MAX_EDGE_PIXELS,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: WEBP_QUALITY })
          .toFile(output);

        const after = await stat(output);
        bytesIn += before.size;
        bytesOut += after.size;
        converted += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failed.push(`${id} (${field}): ${message}`);
      }
    }
  }

  const asMb = (bytes: number) => (bytes / 1024 / 1024).toFixed(1);

  console.log("");
  console.log(`Dikonversi : ${converted} foto`);
  console.log(`Dilewati   : ${reused} (sudah ada)`);
  if (converted > 0) {
    console.log(
      `Ukuran     : ${asMb(bytesIn)} MB menjadi ${asMb(bytesOut)} MB`,
    );
  }
  console.log(`Tidak ada  : ${missing.length}`);
  for (const line of missing.slice(0, 10)) console.log(`   - ${line}`);
  if (missing.length > 10) {
    console.log(`   ... dan ${missing.length - 10} lagi`);
  }
  console.log(`Gagal      : ${failed.length}`);
  for (const line of failed) console.log(`   - ${line}`);
  console.log("");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Gagal:", message);
  process.exit(1);
});
