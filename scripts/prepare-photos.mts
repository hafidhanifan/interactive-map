/*
  Turns the raw Kobo attachments into web ready photos.

  Run it with:  npm run photos
  One category:  npm run photos -- kebun

  Input:   data/raw/<folder>/<folder>.xlsx and data/raw/<folder>/media/
  Output:  public/photos/<id>/<_id>-<field>.webp

  Output names must match the paths written by convert.mts, which builds
  them as /photos/<id>/<_id>-<field>.webp.

  Already converted files are left alone, so a rerun after new survey
  data only processes what is actually new.
*/
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import { DATASETS, type DatasetConfig } from "./kobo/datasets.mts";
import { readRows } from "./kobo/xlsx.mts";

/** Long edge in pixels. Still sharp on a phone opened full screen. */
const MAX_EDGE_PIXELS = 1200;
/** WebP quality. Below about 65 the compression starts to show. */
const WEBP_QUALITY = 72;

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

type Report = {
  config: DatasetConfig;
  converted: number;
  reused: number;
  bytesIn: number;
  bytesOut: number;
  missing: string[];
  failed: string[];
};

async function processDataset(config: DatasetConfig): Promise<Report> {
  const source = path.resolve(
    "data/raw",
    config.folder,
    config.folder + ".xlsx",
  );
  const mediaDir = path.resolve("data/raw", config.folder, "media");
  const outputDir = path.resolve("public/photos", config.id);

  const rows = await readRows(source);
  await mkdir(outputDir, { recursive: true });

  const report: Report = {
    config,
    converted: 0,
    reused: 0,
    bytesIn: 0,
    bytesOut: 0,
    missing: [],
    failed: [],
  };

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

    const submissionDir = path.join(mediaDir, uuid);

    for (const field of config.photoFields) {
      const fileName = row["foto_" + field];
      if (!fileName) continue;

      const output = path.join(outputDir, id + "-" + field + ".webp");
      if (await exists(output)) {
        report.reused += 1;
        continue;
      }

      const input = await resolveFile(submissionDir, fileName);
      if (!input) {
        report.missing.push(id + " (" + field + "): " + fileName);
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
        report.bytesIn += before.size;
        report.bytesOut += after.size;
        report.converted += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        report.failed.push(id + " (" + field + "): " + message);
      }
    }
  }

  return report;
}

function asMb(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1);
}

async function main() {
  const only = process.argv[2];
  const targets = only ? DATASETS.filter((item) => item.id === only) : DATASETS;

  if (targets.length === 0) {
    throw new Error("Kategori tidak dikenal: " + only);
  }

  let totalIn = 0;
  let totalOut = 0;

  console.log("");
  for (const config of targets) {
    const report = await processDataset(config);
    totalIn += report.bytesIn;
    totalOut += report.bytesOut;

    console.log(
      config.label.padEnd(32) +
        report.converted +
        " dikonversi, " +
        report.reused +
        " dilewati",
    );

    if (report.missing.length > 0) {
      console.log("   tidak ada  " + report.missing.length + " berkas");
      for (const line of report.missing.slice(0, 5)) {
        console.log("      - " + line);
      }
      if (report.missing.length > 5) {
        console.log("      ... dan " + (report.missing.length - 5) + " lagi");
      }
    }

    for (const line of report.failed) console.log("   gagal      " + line);
  }

  if (totalIn > 0) {
    console.log("");
    console.log(
      "Ukuran total: " +
        asMb(totalIn) +
        " MB menjadi " +
        asMb(totalOut) +
        " MB",
    );
  }
  console.log("");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Gagal:", message);
  process.exit(1);
});
