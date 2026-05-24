// ============================================================
// lib/dates.ts — date-fns utility wrappers
// ============================================================

import {
  format,
  startOfYear,
  endOfYear,
  startOfWeek,
  addDays,
  isAfter,
  isSameDay,
  isToday,
} from 'date-fns';

/** Returns today as 'YYYY-MM-DD' */
export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/** Formats a date string 'YYYY-MM-DD' into display format like 'SUNDAY 25 MAY' */
export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00'); // avoid timezone shift
  return format(date, 'EEEE d MMMM').toUpperCase();
}

/** Returns the day name like 'SUNDAY' */
export function getDayName(date?: Date): string {
  return format(date ?? new Date(), 'EEEE').toUpperCase();
}

/** Returns the date portion like 'SUNDAY\n25 MAY' for the log screen */
export function getLogScreenDate(date?: Date): { dayName: string; dayMonth: string } {
  const d = date ?? new Date();
  return {
    dayName: format(d, 'EEEE').toUpperCase(),
    dayMonth: format(d, 'd MMM').toUpperCase(),
  };
}

/** Returns a full year grid: weeks[col][row] where each element is a Date */
export function buildYearGrid(year?: number): Date[][] {
  const now = new Date();
  const targetYear = year ?? now.getFullYear();
  const yearStart = startOfYear(new Date(targetYear, 0, 1));
  const yearEnd = endOfYear(new Date(targetYear, 0, 1));

  const weeks: Date[][] = [];
  // Start from Monday of the week containing Jan 1
  let current = startOfWeek(yearStart, { weekStartsOn: 1 });

  while (!isAfter(current, yearEnd)) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(addDays(current, i));
    }
    weeks.push(week);
    current = addDays(current, 7);
  }

  return weeks;
}

export { isAfter, isSameDay, isToday, format };
