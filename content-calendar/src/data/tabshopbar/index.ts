import type { CalendarData } from "../types";
import march2026 from "./2026-03.json";
import april2026 from "./2026-04.json";

const months: Record<string, CalendarData> = {
  "2026-03": march2026 as CalendarData,
  "2026-04": april2026 as CalendarData,
};

export function getMonths(): string[] {
  return Object.keys(months).sort();
}

export function getCalendarData(month: string): CalendarData | null {
  return months[month] ?? null;
}

export function getClientName(): string {
  return march2026.client;
}
