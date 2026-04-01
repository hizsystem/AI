import { put, list } from "@vercel/blob";
import type { WeeklyReport, KpiData, RefData, HuenicBrand } from "@/data/huenic-types";
import { VEGGIET_REF_COLLECTIONS, VINKER_REF_COLLECTIONS } from "@/data/huenic-types";

// Static seed fallback
import veggietReportW11 from "@/data/huenic-seed/veggiet-report-2026-W11.json";
import vinkerReportW11 from "@/data/huenic-seed/vinker-report-2026-W11.json";
import veggietKpi202603 from "@/data/huenic-seed/veggiet-kpi-2026-03.json";
import vinkerKpi202603 from "@/data/huenic-seed/vinker-kpi-2026-03.json";
import veggietGuideSeed from "@/data/huenic-seed/veggiet-guide.json";
import vinkerGuideSeed from "@/data/huenic-seed/vinker-guide.json";

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

const _blobWarned = { current: false };
function warnNoBlobToken() {
  if (!_blobWarned.current && !process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn("⚠️ BLOB_READ_WRITE_TOKEN 없음 — 휴닉 데이터가 인메모리에만 저장됩니다. .env.local에 토큰을 추가하세요.");
    _blobWarned.current = true;
  }
}

async function blobFetch(path: string): Promise<Response | null> {
  try {
    const { blobs } = await list({ prefix: path, limit: 1 });
    if (blobs.length > 0) {
      const cacheBust = `?t=${Date.now()}`;
      const res = await fetch(blobs[0].url + cacheBust, { cache: "no-store" });
      if (res.ok) return res;
    }
  } catch (e) {
    console.error("Blob read error:", e);
  }
  return null;
}

async function blobWrite(path: string, data: unknown): Promise<void> {
  await put(path, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

// --- Weekly Report ---

export async function getWeeklyReport(
  brand: HuenicBrand,
  year: number,
  week: number
): Promise<WeeklyReport | null> {
  warnNoBlobToken();
  const path = reportBlobPath(brand, year, week);
  const key = `${brand}:${year}-W${week}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const res = await blobFetch(path);
    if (res) return (await res.json()) as WeeklyReport;
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

  await blobWrite(path, data);
}

// --- KPI ---

export async function getKpiData(
  brand: HuenicBrand,
  year: number,
  month: number
): Promise<KpiData | null> {
  warnNoBlobToken();
  const mm = String(month).padStart(2, "0");
  const path = kpiBlobPath(brand, year, mm);
  const key = `${brand}:${year}-${mm}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const res = await blobFetch(path);
    if (res) return (await res.json()) as KpiData;
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

  await blobWrite(path, data);
}

// --- Guide ---

export interface GuideSeriesData {
  id: string;
  name: string;
  color: string;
  hook: string;
  concern: string;
  oneLiner: string;
  reference: string;
  referenceDetail: string;
  visual: string[];
  examples: string[];
  frequency: string;
  format: string;
}

export interface GuideData {
  brand: HuenicBrand;
  keyMessage: string;
  series: GuideSeriesData[];
}

function guideBlobPath(brand: HuenicBrand): string {
  return `huenic/${brand}/guide.json`;
}

const STATIC_GUIDE: Record<string, GuideData> = {
  veggiet: veggietGuideSeed as unknown as GuideData,
  vinker: vinkerGuideSeed as unknown as GuideData,
};

export async function getGuideData(brand: HuenicBrand): Promise<GuideData | null> {
  warnNoBlobToken();
  const path = guideBlobPath(brand);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const res = await blobFetch(path);
    if (res) return (await res.json()) as GuideData;
  }

  return STATIC_GUIDE[brand] ?? null;
}

export async function saveGuideData(brand: HuenicBrand, data: GuideData): Promise<void> {
  const path = guideBlobPath(brand);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    STATIC_GUIDE[brand] = data;
    return;
  }

  await blobWrite(path, data);
}

// --- Refs ---

function refBlobPath(brand: HuenicBrand): string {
  return `huenic/${brand}/refs.json`;
}

function defaultRefData(brand: HuenicBrand): RefData {
  return {
    brand,
    collections: brand === "veggiet" ? VEGGIET_REF_COLLECTIONS : VINKER_REF_COLLECTIONS,
    items: [],
  };
}

export async function getRefData(brand: HuenicBrand): Promise<RefData> {
  warnNoBlobToken();
  const path = refBlobPath(brand);

  const seedCollections = brand === "veggiet" ? VEGGIET_REF_COLLECTIONS : VINKER_REF_COLLECTIONS;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const res = await blobFetch(path);
    if (res) {
      const data = (await res.json()) as RefData;
      // Always sync collections from seed (source of truth for available collections)
      const existingIds = new Set(data.collections.map((c) => c.id));
      for (const sc of seedCollections) {
        if (!existingIds.has(sc.id)) data.collections.push(sc);
      }
      return data;
    }
  }

  return defaultRefData(brand);
}

export async function saveRefData(brand: HuenicBrand, data: RefData): Promise<void> {
  const path = refBlobPath(brand);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return;
  }

  await blobWrite(path, data);
}
