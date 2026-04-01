import type { WeeklyReport, KpiData, HuenicBrand } from "@/data/huenic-types";

/**
 * Google Sheets "웹에 게시" CSV를 파싱하여 대시보드 데이터로 변환
 *
 * 시트 헤더는 한글. 브랜드명도 한글(베지어트/빙커).
 */

const SHEET_ID = process.env.HUENIC_SHEET_ID || "";

function sheetUrl(tabName: string): string {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
}

/** Parse CSV text into array of objects using header row as keys */
function parseCsv(csv: string): Record<string, string>[] {
  const lines = csv.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseRow(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseRow(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || "";
    });
    return obj;
  });
}

/** Parse a single CSV row, handling quoted fields */
function parseRow(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function num(val: string | undefined): number {
  if (!val) return 0;
  const n = parseFloat(val.replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

/** 브랜드 코드 → 시트에서 쓰는 한글명 */
const BRAND_KR: Record<HuenicBrand, string> = {
  veggiet: "베지어트",
  vinker: "빙커",
};

/** 시트의 유형(한글) → 코드 */
function parseContentType(val: string): "feed" | "reels" | "story" {
  if (val === "릴스" || val === "reels") return "reels";
  if (val === "스토리" || val === "story") return "story";
  return "feed"; // 피드 or feed or default
}

/** Check if Google Sheets integration is configured */
export function isSheetsConfigured(): boolean {
  return SHEET_ID.length > 10;
}

/**
 * Fetch weekly report data from Google Sheets
 */
export async function fetchWeeklyReportFromSheets(
  brand: HuenicBrand,
  weekStr: string // "4월 1w"
): Promise<WeeklyReport | null> {
  if (!isSheetsConfigured()) return null;

  const brandKr = BRAND_KR[brand];

  try {
    // Fetch metrics
    const metricsRes = await fetch(sheetUrl("주간성과"), { next: { revalidate: 300 } });
    if (!metricsRes.ok) return null;
    const metricsRows = parseCsv(await metricsRes.text());

    const row = metricsRows.find(
      (r) => r["브랜드"] === brandKr && r["주차"] === weekStr
    );
    if (!row) return null;

    // Fetch top content
    const contentRes = await fetch(sheetUrl("베스트콘텐츠"), { next: { revalidate: 300 } });
    const contentRows = contentRes.ok
      ? parseCsv(await contentRes.text()).filter(
          (r) => r["브랜드"] === brandKr && r["주차"] === weekStr
        )
      : [];

    // weekStr = "4월 1w" → month=4, week=1
    const wMatch = weekStr.match(/(\d+)월\s*(\d)w/);
    const wMonth = wMatch ? parseInt(wMatch[1], 10) : 0;
    const wWeek = wMatch ? parseInt(wMatch[2], 10) : 0;

    return {
      brand,
      year: new Date().getFullYear(),
      week: wMonth * 10 + wWeek,
      period: row["기간"] || "",
      metrics: {
        followers: num(row["팔로워"]),
        followersChange: num(row["팔로워증감"]),
        postsCount: num(row["게시물수"]),
        engagementRate: num(row["참여율"]),
        erChange: num(row["참여율증감"]),
        topLikes: num(row["최고좋아요"]),
        reach: num(row["도달"]),
        reachChange: num(row["도달증감"]),
      },
      topContent: contentRows.map((c, i) => ({
        id: `sheet-${i}`,
        title: c["제목"] || "",
        type: parseContentType(c["유형"]),
        likes: num(c["좋아요"]),
        comments: num(c["댓글"]),
      })),
      coachComment: null, // 코멘트는 대시보드 웹 UI에서 입력 → Blob 저장
      nextWeekPlan: [],   // 계획도 대시보드에서 입력
    };
  } catch {
    return null;
  }
}

/**
 * Fetch KPI data from Google Sheets
 */
export async function fetchKpiFromSheets(
  brand: HuenicBrand,
  year: number,
  month: number
): Promise<KpiData | null> {
  if (!isSheetsConfigured()) return null;

  const brandKr = BRAND_KR[brand];

  try {
    // Fetch monthly summary
    const summaryRes = await fetch(sheetUrl("월간KPI"), { next: { revalidate: 300 } });
    if (!summaryRes.ok) return null;
    const summaryRows = parseCsv(await summaryRes.text());

    const row = summaryRows.find(
      (r) =>
        r["브랜드"] === brandKr &&
        num(r["연도"]) === year &&
        num(r["월"]) === month
    );
    if (!row) return null;

    // Fetch follower trend
    const followerRes = await fetch(sheetUrl("팔로워추이"), { next: { revalidate: 300 } });
    const followerRows = followerRes.ok
      ? parseCsv(await followerRes.text()).filter((r) => r["브랜드"] === brandKr)
      : [];

    // ER trend: 주간성과에서 참여율 추출 (참여율추이 탭 삭제됨)
    const weeklyRes = await fetch(sheetUrl("주간성과"), { next: { revalidate: 300 } });
    const weeklyRows = weeklyRes.ok
      ? parseCsv(await weeklyRes.text()).filter((r) => r["브랜드"] === brandKr)
      : [];

    return {
      brand,
      year,
      month,
      summary: {
        followers: {
          value: num(row["팔로워"]),
          change: num(row["팔로워증감"]),
          changePercent: num(row["팔로워증감률"]),
        },
        monthlyPosts: {
          value: num(row["월간게시물"]),
          change: num(row["게시물증감"]),
          changePercent: num(row["게시물증감률"]),
        },
        avgER: {
          value: num(row["평균참여율"]),
          change: num(row["참여율증감"]),
        },
        monthlyReach: {
          value: num(row["월간도달"]),
          change: num(row["도달증감"]),
          changePercent: num(row["도달증감률"]),
        },
      },
      followerTrend: {
        labels: followerRows.map((r) => r["월"] || ""),
        total: followerRows.map((r) => num(r["전체"])),
        organic: followerRows.map((r) => num(r["자연유입"])),
        paid: followerRows.map((r) => num(r["광고"])),
      },
      erTrend: {
        labels: weeklyRows.map((r) => r["주차"]?.replace("2026-", "") || ""),
        total: weeklyRows.map((r) => num(r["참여율"])),
        feed: weeklyRows.map((r) => num(r["참여율"])),  // 유형별 breakdown 없으므로 전체값 사용
        reels: weeklyRows.map(() => 0),
        story: weeklyRows.map(() => 0),
      },
    };
  } catch {
    return null;
  }
}
