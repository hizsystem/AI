import { put, list } from "@vercel/blob";
import type { WeeklyReport, KpiData, RefData, HuenicBrand } from "@/data/huenic-types";
import { VEGGIET_REF_COLLECTIONS, VINKER_REF_COLLECTIONS } from "@/data/huenic-types";

function reportBlobPath(brand: HuenicBrand, year: number, week: number): string {
  return `huenic/${brand}/report-${year}-W${week}.json`;
}

function kpiBlobPath(brand: HuenicBrand, year: number, month: string): string {
  return `huenic/${brand}/kpi-${year}-${month}.json`;
}

async function blobFetch(path: string): Promise<Response | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
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
  const path = reportBlobPath(brand, year, week);
  const res = await blobFetch(path);
  if (res) return (await res.json()) as WeeklyReport;
  return null;
}

export async function saveWeeklyReport(
  brand: HuenicBrand,
  year: number,
  week: number,
  data: WeeklyReport
): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  const path = reportBlobPath(brand, year, week);
  await blobWrite(path, data);
}

// --- KPI ---

export async function getKpiData(
  brand: HuenicBrand,
  year: number,
  month: number
): Promise<KpiData | null> {
  const mm = String(month).padStart(2, "0");
  const path = kpiBlobPath(brand, year, mm);
  const res = await blobFetch(path);
  if (res) return (await res.json()) as KpiData;
  return null;
}

export async function saveKpiData(
  brand: HuenicBrand,
  year: number,
  month: number,
  data: KpiData
): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  const mm = String(month).padStart(2, "0");
  const path = kpiBlobPath(brand, year, mm);
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

export async function getGuideData(brand: HuenicBrand): Promise<GuideData | null> {
  const path = guideBlobPath(brand);
  const res = await blobFetch(path);
  if (res) return (await res.json()) as GuideData;
  return null;
}

export async function saveGuideData(brand: HuenicBrand, data: GuideData): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  const path = guideBlobPath(brand);
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
  const path = refBlobPath(brand);
  const seedCollections = brand === "veggiet" ? VEGGIET_REF_COLLECTIONS : VINKER_REF_COLLECTIONS;

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

  return defaultRefData(brand);
}

export async function saveRefData(brand: HuenicBrand, data: RefData): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  const path = refBlobPath(brand);
  await blobWrite(path, data);
}
