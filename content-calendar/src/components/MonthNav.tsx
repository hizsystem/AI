"use client";

interface MonthNavProps {
  currentMonth: string;
  months: string[];
  onMonthChange: (month: string) => void;
}

function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-");
  const monthNum = parseInt(m, 10);
  return `${monthNum} / ${year.slice(2)}`;
}

export default function MonthNav({
  currentMonth,
  months,
  onMonthChange,
}: MonthNavProps) {
  const currentIndex = months.indexOf(currentMonth);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < months.length - 1;

  return (
    <div className="flex items-center justify-center gap-6 py-6">
      <button
        onClick={() => hasPrev && onMonthChange(months[currentIndex - 1])}
        disabled={!hasPrev}
        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous month"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
        {formatMonthLabel(currentMonth)}
      </span>
      <button
        onClick={() => hasNext && onMonthChange(months[currentIndex + 1])}
        disabled={!hasNext}
        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next month"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
