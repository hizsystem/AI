"use client";

import { useState } from "react";
import Calendar from "@/components/Calendar";
import { getCalendarData, getMonths } from "@/data/tabshopbar";

const allMonths = getMonths();

export default function TabshopbarCalendar() {
  const [currentMonth, setCurrentMonth] = useState(allMonths[allMonths.length - 1]);
  const data = getCalendarData(currentMonth);

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400">No data for {currentMonth}</p>
      </div>
    );
  }

  return (
    <Calendar
      data={data}
      allMonths={allMonths}
      onMonthChange={setCurrentMonth}
    />
  );
}
