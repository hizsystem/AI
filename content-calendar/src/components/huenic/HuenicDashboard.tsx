"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import BrandSwitcher from "./BrandSwitcher";
import TabNavigation, { type HuenicTab } from "./TabNavigation";
import CalendarTab from "./CalendarTab";
import WeeklyReportTab from "./WeeklyReportTab";
import KpiTab from "./KpiTab";
import MoodboardTab from "./MoodboardTab";
import RefTab from "./RefTab";
import GuideTab from "./GuideTab";
import type { HuenicBrand } from "@/data/huenic-types";

function validBrand(b: string | null): HuenicBrand {
  return b === "veggiet" || b === "vinker" ? b : "veggiet";
}

function validTab(t: string | null): HuenicTab {
  return t === "calendar" || t === "moodboard" || t === "ref" || t === "guide" || t === "report" || t === "kpi" ? t : "calendar";
}

export default function HuenicDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const brand = validBrand(searchParams.get("brand"));
  const tab = validTab(searchParams.get("tab"));

  const updateParams = useCallback(
    (updates: { brand?: HuenicBrand; tab?: HuenicTab }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.brand) params.set("brand", updates.brand);
      if (updates.tab) params.set("tab", updates.tab);
      router.push(`/huenic?${params.toString()}`);
    },
    [searchParams, router]
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold tracking-widest text-gray-400 mb-1">
              HUENIC DASHBOARD
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {brand === "veggiet" ? "VEGGIET" : "VINKER"}
            </h1>
          </div>
          <BrandSwitcher
            brand={brand}
            onBrandChange={(b) => updateParams({ brand: b })}
          />
        </div>

        {/* Tabs */}
        <TabNavigation
          activeTab={tab}
          onTabChange={(t) => updateParams({ tab: t })}
        />

        {/* Tab Content */}
        <div className="mt-6">
          {tab === "calendar" && <CalendarTab brand={brand} />}
          {tab === "moodboard" && <MoodboardTab brand={brand} />}
          {tab === "ref" && <RefTab brand={brand} />}
          {tab === "guide" && <GuideTab brand={brand} />}
          {tab === "report" && <WeeklyReportTab brand={brand} />}
          {tab === "kpi" && <KpiTab brand={brand} />}
        </div>
      </div>
    </div>
  );
}
