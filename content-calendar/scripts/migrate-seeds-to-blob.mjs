#!/usr/bin/env node
/**
 * One-time migration: upload all seed JSON files to Vercel Blob.
 * Run from content-calendar/ directory:
 *   BLOB_READ_WRITE_TOKEN=xxx node scripts/migrate-seeds-to-blob.mjs
 */
import { put, list } from "@vercel/blob";
import { readFileSync, readdirSync } from "fs";
import { join, basename } from "path";

const SEED_DIR = join(import.meta.dirname, "../src/data");

const MIGRATIONS = [
  // Calendar seeds: tabshopbar
  ...glob("tabshopbar", "tabshopbar"),
  // Calendar seeds: huenic
  ...glob("huenic-seed", "huenic-veggiet", "veggiet-2026-"),
  ...glob("huenic-seed", "huenic-vinker", "vinker-2026-"),
  // Huenic guide/kpi/report
  { file: "huenic-seed/veggiet-guide.json", blobPath: "huenic/veggiet/guide.json" },
  { file: "huenic-seed/vinker-guide.json", blobPath: "huenic/vinker/guide.json" },
  { file: "huenic-seed/veggiet-kpi-2026-03.json", blobPath: "huenic/veggiet/kpi-2026-03.json" },
  { file: "huenic-seed/vinker-kpi-2026-03.json", blobPath: "huenic/vinker/kpi-2026-03.json" },
  { file: "huenic-seed/veggiet-report-2026-W11.json", blobPath: "huenic/veggiet/report-2026-W11.json" },
  { file: "huenic-seed/vinker-report-2026-W11.json", blobPath: "huenic/vinker/report-2026-W11.json" },
];

function glob(dir, clientPrefix, filePrefix) {
  const fullDir = join(SEED_DIR, dir);
  const prefix = filePrefix || "";
  try {
    return readdirSync(fullDir)
      .filter((f) => f.endsWith(".json") && (prefix ? f.startsWith(prefix) : true))
      .filter((f) => /\d{4}-\d{2}\.json$/.test(f))
      .map((f) => {
        const month = f.match(/(\d{4}-\d{2})\.json$/)?.[1];
        return {
          file: `${dir}/${f}`,
          blobPath: `calendar/${clientPrefix}/${month}.json`,
        };
      });
  } catch {
    return [];
  }
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN is required");
    process.exit(1);
  }

  console.log(`Migrating ${MIGRATIONS.length} seed files to Blob...\n`);

  for (const { file, blobPath } of MIGRATIONS) {
    const fullPath = join(SEED_DIR, file);
    try {
      // Check if already exists in Blob
      const { blobs } = await list({ prefix: blobPath, limit: 1 });
      if (blobs.length > 0) {
        console.log(`  SKIP  ${blobPath} (already exists, size: ${blobs[0].size})`);
        continue;
      }

      const content = readFileSync(fullPath, "utf-8");
      JSON.parse(content); // validate JSON

      await put(blobPath, content, {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      console.log(`  OK    ${blobPath} (${content.length} bytes)`);
    } catch (e) {
      console.error(`  FAIL  ${blobPath}: ${e.message}`);
    }
  }

  console.log("\nDone!");
}

main();
