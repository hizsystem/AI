"use client";

import type { HuenicBrand } from "@/data/huenic-types";

const BRANDS: { id: HuenicBrand; label: string; emoji: string; accent: string }[] = [
  { id: "veggiet", label: "VEGGIET", emoji: "\uD83C\uDF31", accent: "bg-emerald-500" },
  { id: "vinker", label: "VINKER", emoji: "\uD83E\uDED8", accent: "bg-purple-500" },
];

interface BrandSwitcherProps {
  brand: HuenicBrand;
  onBrandChange: (brand: HuenicBrand) => void;
}

export default function BrandSwitcher({ brand, onBrandChange }: BrandSwitcherProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
      {BRANDS.map((b) => {
        const active = brand === b.id;
        return (
          <button
            key={b.id}
            onClick={() => onBrandChange(b.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              active
                ? b.id === "veggiet"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-purple-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-white"
            }`}
          >
            <span>{b.emoji}</span>
            <span>{b.label}</span>
          </button>
        );
      })}
    </div>
  );
}
