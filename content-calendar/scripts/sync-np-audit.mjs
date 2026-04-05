#!/usr/bin/env node
/**
 * NP 진단 결과를 Brand Dashboard에 동기화하는 스크립트.
 *
 * 사용법:
 *   node scripts/sync-np-audit.mjs <storeId> <auditJsonPath>
 *
 * 또는 Claude Code np-audit 스킬 실행 후 자동 호출:
 *   node scripts/sync-np-audit.mjs mirye-gukbap clients/mirye-gukbap/np-audit.json
 *
 * 환경변수:
 *   DASHBOARD_URL (기본: https://hiz-brand-dashboard.vercel.app)
 *   ADMIN_PASSWORD (기본: .env.local에서 읽음)
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const DASHBOARD_URL =
  process.env.DASHBOARD_URL || "https://hiz-brand-dashboard.vercel.app";

async function main() {
  const [, , storeId, auditPath] = process.argv;

  if (!storeId) {
    console.error("Usage: sync-np-audit.mjs <storeId> [auditJsonPath]");
    process.exit(1);
  }

  let auditData;

  if (auditPath && existsSync(auditPath)) {
    // Read from file
    const raw = readFileSync(resolve(auditPath), "utf-8");
    auditData = JSON.parse(raw);
    console.log(`Read audit data from ${auditPath}`);
  } else {
    // Read from stdin
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    auditData = JSON.parse(Buffer.concat(chunks).toString());
    console.log("Read audit data from stdin");
  }

  // Login to get auth cookie
  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    // Try reading from .env.local
    const envPath = resolve(process.cwd(), ".env.local");
    if (existsSync(envPath)) {
      const envContent = readFileSync(envPath, "utf-8");
      const match = envContent.match(/ADMIN_PASSWORD="?([^"\n]+)"?/);
      if (match) password = match[1];
    }
  }

  if (!password) {
    console.error("ADMIN_PASSWORD not found");
    process.exit(1);
  }

  // Auth
  const authRes = await fetch(`${DASHBOARD_URL}/api/admin/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  if (!authRes.ok) {
    console.error("Auth failed:", await authRes.text());
    process.exit(1);
  }

  const cookies = authRes.headers.getSetCookie?.() || [];
  const authCookie = cookies
    .find((c) => c.startsWith("cc-admin-auth="))
    ?.split(";")[0];

  if (!authCookie) {
    console.error("No auth cookie received");
    process.exit(1);
  }

  // Sync audit data
  const syncRes = await fetch(
    `${DASHBOARD_URL}/api/np/${storeId}/audit`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify(auditData),
    }
  );

  if (syncRes.ok) {
    console.log(
      `Synced audit for ${storeId}: ${auditData.totalScore}/100 (${auditData.grade})`
    );
  } else {
    console.error("Sync failed:", await syncRes.text());
    process.exit(1);
  }
}

main().catch(console.error);
