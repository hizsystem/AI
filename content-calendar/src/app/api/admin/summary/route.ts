import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listClientConfigs } from "@/lib/client-config-storage";
import { getCalendar } from "@/lib/storage";
import type { ContentItem } from "@/data/types";

export const dynamic = "force-dynamic";

interface ClientSummary {
  slug: string;
  name: string;
  brandColor: string;
  logo: { src: string; alt: string } | null;
  tabs: string[];
  brands?: { id: string; label: string; emoji: string }[];
  currentMonth: string;
  stats: {
    total: number;
    planning: number;
    needsConfirm: number;
    uploaded: number;
  };
  nextContent: { date: string; title: string } | null;
  thisWeekItems: ContentItem[];
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { start: fmt(monday), end: fmt(sunday) };
}

export async function GET() {
  // Admin auth check
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get("cc-admin-auth");
  if (adminAuth?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const configs = await listClientConfigs();
    const currentMonth = getCurrentMonth();
    const week = getWeekRange();
    const today = new Date().toISOString().slice(0, 10);

    const summaries: ClientSummary[] = await Promise.all(
      configs.map(async (config) => {
        // Determine which calendar keys to fetch
        let calendarKeys: string[];
        if (config.brands && config.calendarClientPrefix) {
          calendarKeys = config.brands.map(
            (b) => `${config.calendarClientPrefix}-${b.id}`
          );
        } else {
          calendarKeys = [config.slug];
        }

        let allItems: ContentItem[] = [];
        for (const key of calendarKeys) {
          const data = await getCalendar(key, currentMonth);
          if (data) {
            allItems = allItems.concat(data.items);
          }
        }

        const stats = {
          total: allItems.length,
          planning: allItems.filter((i) => (i.status || "planning") === "planning").length,
          needsConfirm: allItems.filter((i) => i.status === "needs-confirm").length,
          uploaded: allItems.filter((i) => i.status === "uploaded").length,
        };

        // Next upcoming content (from today onward)
        const upcoming = allItems
          .filter((i) => i.date >= today)
          .sort((a, b) => a.date.localeCompare(b.date));
        const nextContent = upcoming.length > 0
          ? { date: upcoming[0].date, title: upcoming[0].title }
          : null;

        // This week's items
        const thisWeekItems = allItems
          .filter((i) => i.date >= week.start && i.date <= week.end)
          .sort((a, b) => a.date.localeCompare(b.date));

        return {
          slug: config.slug,
          name: config.name,
          brandColor: config.brandColor,
          logo: config.logo,
          tabs: config.tabs,
          brands: config.brands?.map((b) => ({
            id: b.id,
            label: b.label,
            emoji: b.emoji,
          })),
          currentMonth,
          stats,
          nextContent,
          thisWeekItems,
        };
      })
    );

    return NextResponse.json({ summaries, week, currentMonth });
  } catch (error) {
    console.error("Admin summary error:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
