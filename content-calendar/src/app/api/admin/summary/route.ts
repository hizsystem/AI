import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listProjectConfigs } from "@/lib/client-config-storage";
import { getCalendar } from "@/lib/storage";
import type { ContentItem } from "@/data/types";
import type { ChannelType, FinanceConfig } from "@/data/client-config";

export const dynamic = "force-dynamic";

interface ProjectSummary {
  slug: string;
  name: string;
  emoji?: string;
  brandColor: string;
  logo: { src: string; alt: string } | null;
  status: "active" | "paused" | "completed";
  channels: ChannelType[];
  brands?: { id: string; label: string; emoji: string }[];
  finance?: FinanceConfig;
  currentMonth: string;
  stats: {
    total: number;
    planning: number;
    needsConfirm: number;
    uploaded: number;
  };
  nextContent: { date: string; title: string } | null;
  thisWeekItems: (ContentItem & { brandLabel?: string })[];
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
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get("cc-admin-auth");
  if (adminAuth?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await listProjectConfigs();
    const currentMonth = getCurrentMonth();
    const week = getWeekRange();
    const today = new Date().toISOString().slice(0, 10);

    const summaries: ProjectSummary[] = await Promise.all(
      projects.map(async (project) => {
        const igChannel = project.channels.find(
          (c) => c.type === "instagram" && c.enabled
        );

        // Fetch calendar data
        let allItems: (ContentItem & { _calendarKey?: string; _brandId?: string })[] = [];
        if (igChannel) {
          if (project.brands && igChannel.calendarClientPrefix) {
            for (const brand of project.brands) {
              const key = `${igChannel.calendarClientPrefix}-${brand.id}`;
              const data = await getCalendar(key, currentMonth);
              if (data) {
                allItems = allItems.concat(
                  data.items.map((item) => ({ ...item, _calendarKey: key, _brandId: brand.id }))
                );
              }
            }
          } else {
            const data = await getCalendar(project.slug, currentMonth);
            if (data) {
              allItems = allItems.concat(
                data.items.map((item) => ({ ...item, _calendarKey: project.slug }))
              );
            }
          }
        }

        const calcStats = (items: ContentItem[]) => ({
          total: items.length,
          planning: items.filter((i) => (i.status || "planning") === "planning").length,
          needsConfirm: items.filter((i) => i.status === "needs-confirm").length,
          uploaded: items.filter((i) => i.status === "uploaded").length,
        });

        const stats = calcStats(allItems);

        // Per-brand stats
        const brandStats: Record<string, typeof stats> = {};
        if (project.brands) {
          for (const brand of project.brands) {
            const brandItems = allItems.filter((i) => i._brandId === brand.id);
            brandStats[brand.id] = calcStats(brandItems);
          }
        }

        const upcoming = allItems
          .filter((i) => i.date >= today)
          .sort((a, b) => a.date.localeCompare(b.date));
        const nextContent =
          upcoming.length > 0
            ? { date: upcoming[0].date, title: upcoming[0].title }
            : null;

        const thisWeekItems = allItems
          .filter((i) => i.date >= week.start && i.date <= week.end)
          .sort((a, b) => a.date.localeCompare(b.date));

        return {
          slug: project.slug,
          name: project.name,
          emoji: project.emoji,
          brandColor: project.brandColor,
          logo: project.logo,
          status: project.status,
          channels: project.channels
            .filter((c) => c.enabled)
            .map((c) => c.type),
          npStoreId: project.channels.find((c) => c.type === "naver-place" && c.enabled)?.storeId,
          brands: project.brands?.map((b) => ({
            id: b.id,
            label: b.label,
            emoji: b.emoji,
          })),
          finance: project.finance,
          accessToken: project.accessToken,
          brandStats: Object.keys(brandStats).length > 0 ? brandStats : undefined,
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
