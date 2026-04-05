"use client";

import type { Category } from "@/data/types";

interface CategoryLegendProps {
  categories: Category[];
}

export default function CategoryLegend({ categories }: CategoryLegendProps) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 px-2">
      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: cat.color }}
          />
          <span className="text-xs text-gray-500">{cat.name}</span>
          {cat.description && (
            <span className="text-[11px] text-gray-400">— {cat.description}</span>
          )}
        </div>
      ))}
    </div>
  );
}
