import { put, list, del } from "@vercel/blob";
import type { WeeklyReport, KpiData, HuenicBrand } from "@/data/huenic-types";

// Static seed fallback
import veggietReportW11 from "@/data/huenic-seed/veggiet-report-2026-W11.json";
import vinkerReportW11 from "@/data/huenic-seed/vinker-report-2026-W11.json";
import veggietKpi202603 from "@/data/huenic-seed/veggiet-kpi-2026-03.json";
import vinkerKpi202603 from "@/data/huenic-seed/vinker-kpi-2026-03.json";

const STATIC_REPORTS: Record<string, WeeklyReport> = {
  "veggiet:2026-W11": veggietReportW11 as WeeklyReport,
  "vinker:2026-W11": vinkerReportW11 as WeeklyReport,
};

const STATIC_KPI: Record<string, KpiData> = {
  "veggiet:2026-03": veggietKpi202603 as KpiData,
  "vinker:2026-03": vinkerKpi202603 as KpiData,
};

function reportBlobPath(brand: HuenicBrand, year: number, week: number): string {
  return `huenic/${brand}/report-${year}-W${week}.json`;
}

function kpiBlobPath(brand: HuenicBrand, year: number, month: string): string {
  return `huenic/${brand}/kpi-${year}-${month}.json`;
}

export async function getWeeklyReport(
  brand: HuenicBrand,
  year: number,
  week: number
): Promise<WeeklyReport | null> {
  const path = reportBlobPath(brand, year, week);
  const key = `${brand}:${year}-W${week}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: path, limit: 1 });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url);
        if (res.ok) {
          return (await res.json()) as WeeklyReport;
        }
      }
    } catch (e) {
      console.error("Blob read error (report):", e);
    }
  }

  return STATIC_REPORTS[key] ?? null;
}

export async function saveWeeklyReport(
  brand: HuenicBrand,
  year: number,
  week: number,
  data: WeeklyReport
): Promise<void> {
  const path = reportBlobPath(brand, year, week);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    STATIC_REPORTS[`${brand}:${year}-W${week}`] = data;
    return;
  }

  try {
    const { blobs } = await list({ prefix: path, limit: 1 });
    if (blobs.length > 0) {
      await del(blobs[0].url);
    }
  } catch {
    // ignore
  }

  await put(path, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

export async function getKpiData(
  brand: HuenicBrand,
  year: number,
  month: number
): Promise<KpiData | null> {
  const mm = String(month).padStart(2, "0");
  const path = kpiBlobPath(brand, year, mm);
  const key = `${brand}:${year}-${mm}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: path, limit: 1 });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url);
        if (res.ok) {
          return (await res.json()) as KpiData;
        }
      }
    } catch (e) {
      console.error("Blob read error (kpi):", e);
    }
  }

  return STATIC_KPI[key] ?? null;
}

export async function saveKpiData(
  brand: HuenicBrand,
  year: number,
  month: number,
  data: KpiData
): Promise<void> {
  const mm = String(month).padStart(2, "0");
  const path = kpiBlobPath(brand, year, mm);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    STATIC_KPI[`${brand}:${year}-${mm}`] = data;
    return;
  }

  try {
    const { blobs } = await list({ prefix: path, limit: 1 });
    if (blobs.length > 0) {
      await del(blobs[0].url);
    }
  } catch {
    // ignore
  }

  await put(path, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}
