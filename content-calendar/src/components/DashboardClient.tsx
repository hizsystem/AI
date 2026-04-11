"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import BrandSwitcher from "./huenic/BrandSwitcher";
import TabNavigation from "./huenic/TabNavigation";
import CalendarTab from "./huenic/CalendarTab";
import WeeklyReportTab from "./huenic/WeeklyReportTab";
import KpiTab from "./huenic/KpiTab";
import MoodboardTab from "./huenic/MoodboardTab";
import RefTab from "./huenic/RefTab";
import GuideTab from "./huenic/GuideTab";
import type { ClientConfig, TabId } from "@/data/client-config";
import type { HuenicBrand } from "@/data/huenic-types";

interface Props {
  config: ClientConfig;
}

export default function DashboardClient({ config }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const brands = config.brands ?? [];
  const tabs = config.tabs;

  const validBrand = (b: string | null): string => {
    if (b && brands.some((br) => br.id === b)) return b;
    return brands[0]?.id ?? "";
  };

  const validTab = (t: string | null): TabId => {
    if (t && tabs.includes(t as TabId)) return t as TabId;
    return tabs[0];
  };

  const brand = validBrand(searchParams.get("brand"));
  const tab = validTab(searchParams.get("tab"));

  const updateParams = useCallback(
    (updates: { brand?: string; tab?: TabId }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.brand) params.set("brand", updates.brand);
      if (updates.tab) params.set("tab", updates.tab);
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const currentBrandLabel =
    brands.find((b) => b.id === brand)?.label ?? config.name;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <p className="text-xs font-semibold tracking-widest text-gray-400 mb-1">
              {config.dashboardTitle ?? `${config.name} DASHBOARD`}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {currentBrandLabel}
            </h1>
          </div>
          {brands.length > 1 && (
            <BrandSwitcher
              brand={brand as HuenicBrand}
              brands={brands}
              onBrandChange={(b) => updateParams({ brand: b })}
            />
          )}
        </div>

        {/* Tabs */}
        <TabNavigation
          tabs={tabs}
          activeTab={tab}
          onTabChange={(t) => updateParams({ tab: t })}
        />

        {/* Tab Content */}
        <div className="mt-6">
          {tab === "calendar" && <CalendarTab brand={brand as HuenicBrand} />}
          {tab === "moodboard" && <MoodboardTab brand={brand as HuenicBrand} brandConfig={brands.find((b) => b.id === brand)} />}
          {tab === "ref" && <RefTab brand={brand as HuenicBrand} />}
          {tab === "guide" && <GuideTab brand={brand as HuenicBrand} />}
          {tab === "report" && <WeeklyReportTab brand={brand as HuenicBrand} />}
          {tab === "kpi" && <KpiTab brand={brand as HuenicBrand} />}
        </div>
      </div>
    </div>
  );
}
