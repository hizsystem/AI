#!/usr/bin/env node
/**
 * Patch `config/clients/huenic.json` in Vercel Blob to restore the `ig-guide`
 * block on the Instagram channel. This was missing after an admin save.
 *
 * Usage:
 *   node -r dotenv/config scripts/fix-huenic-guide-tab.mjs dotenv_config_path=.env.local
 *   (or) BLOB_READ_WRITE_TOKEN=xxx node scripts/fix-huenic-guide-tab.mjs
 */
import { put, list } from "@vercel/blob";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  const envPath = join(import.meta.dirname, "../.env.local");
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN not set");
  process.exit(1);
}

const CONFIG_PATH = "config/clients/huenic.json";
const REQUIRED_BLOCKS = [
  "ig-calendar",
  "ig-moodboard",
  "ig-reference",
  "ig-guide",
  "ig-report",
  "ig-kpi",
];

async function main() {
  const { blobs } = await list({ prefix: CONFIG_PATH, limit: 1 });
  if (blobs.length === 0) {
    console.log("No Blob config found at", CONFIG_PATH, "- nothing to patch (hardcoded defaults will apply).");
    return;
  }

  const res = await fetch(blobs[0].url + `?t=${Date.now()}`, { cache: "no-store" });
  const config = await res.json();

  const ig = config.channels?.find((c) => c.type === "instagram");
  if (!ig) {
    console.error("Instagram channel missing from blob config. Aborting.");
    process.exit(2);
  }

  console.log("Before:", ig.blocks);

  const before = new Set(ig.blocks || []);
  const nextBlocks = [...REQUIRED_BLOCKS];
  // Preserve any extras that were present
  for (const b of ig.blocks || []) if (!nextBlocks.includes(b)) nextBlocks.push(b);

  ig.blocks = nextBlocks;
  ig.enabled = true;

  // Backup first
  const backupPath = `${CONFIG_PATH.replace(".json", "")}-backup-${Date.now()}.json`;
  await put(backupPath, JSON.stringify({ ...config, channels: config.channels.map((c) => c === ig ? { ...c, blocks: [...before] } : c) }), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log("Backup written:", backupPath);

  await put(CONFIG_PATH, JSON.stringify(config), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  console.log("After :", ig.blocks);
  console.log("✓ Patched Blob config. Hard-refresh the dashboard to see the 가이드 tab.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
