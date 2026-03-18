"use client";

import type { WeeklyReport } from "@/data/huenic-types";

interface TopContentProps {
  items: WeeklyReport["topContent"];
}

const TYPE_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  feed: { label: "피드", bg: "bg-blue-100", text: "text-blue-700" },
  reels: { label: "릴스", bg: "bg-orange-100", text: "text-orange-700" },
  story: { label: "스토리", bg: "bg-purple-100", text: "text-purple-700" },
};

export default function TopContent({ items }: TopContentProps) {
  if (!items || items.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-6 text-center">
        이번 주 콘텐츠 데이터가 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const style = TYPE_STYLES[item.type] ?? TYPE_STYLES.feed;
        return (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3"
          >
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${style.bg} ${style.text}`}
            >
              {style.label}
            </span>
            <span className="text-sm text-gray-900 truncate flex-1 min-w-0">
              {item.title}
            </span>
            <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
                {item.likes.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z"
                    clipRule="evenodd"
                  />
                </svg>
                {item.comments.toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
