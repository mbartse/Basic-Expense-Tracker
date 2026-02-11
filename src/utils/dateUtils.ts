import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  getWeek,
  getWeekYear,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { WEEK_START_DAY } from '../constants/config';

type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Default week options for date-fns
const defaultWeekOptions = { weekStartsOn: WEEK_START_DAY as WeekStartDay };

function getWeekOptions(weekStartDay?: WeekStartDay) {
  return weekStartDay !== undefined
    ? { weekStartsOn: weekStartDay }
    : defaultWeekOptions;
}

/**
 * Get the date string for a date (YYYY-MM-DD)
 */
export function getDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get the week key for a date (YYYY-Www)
 */
export function getWeekKey(date: Date, weekStartDay?: WeekStartDay): string {
  const options = getWeekOptions(weekStartDay);
  const year = getWeekYear(date, options);
  const week = getWeek(date, options);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

/**
 * Get the month key for a date (YYYY-MM)
 */
export function getMonthKey(date: Date): string {
  return format(date, 'yyyy-MM');
}

/**
 * Get the start of the week for a date
 */
export function getWeekStart(date: Date, weekStartDay?: WeekStartDay): Date {
  return startOfWeek(date, getWeekOptions(weekStartDay));
}

/**
 * Get the end of the week for a date
 */
export function getWeekEnd(date: Date, weekStartDay?: WeekStartDay): Date {
  return endOfWeek(date, getWeekOptions(weekStartDay));
}

/**
 * Get all days in a week
 */
export function getDaysInWeek(weekStart: Date, weekStartDay?: WeekStartDay): Date[] {
  return eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, getWeekOptions(weekStartDay)),
  });
}

/**
 * Get the start of the month for a date
 */
export function getMonthStart(date: Date): Date {
  return startOfMonth(date);
}

/**
 * Get the end of the month for a date
 */
export function getMonthEnd(date: Date): Date {
  return endOfMonth(date);
}

/**
 * Get all days in a month
 */
export function getDaysInMonth(monthStart: Date): Date[] {
  return eachDayOfInterval({
    start: monthStart,
    end: endOfMonth(monthStart),
  });
}

export function getPreviousDay(date: Date): Date {
  return subDays(date, 1);
}

export function getNextDay(date: Date): Date {
  return addDays(date, 1);
}

/**
 * Navigate to previous week
 */
export function getPreviousWeek(date: Date): Date {
  return subWeeks(date, 1);
}

/**
 * Navigate to next week
 */
export function getNextWeek(date: Date): Date {
  return addWeeks(date, 1);
}

/**
 * Navigate to previous month
 */
export function getPreviousMonth(date: Date): Date {
  return subMonths(date, 1);
}

/**
 * Navigate to next month
 */
export function getNextMonth(date: Date): Date {
  return addMonths(date, 1);
}

/**
 * Format a week range for display
 * e.g., "Jan 13 - Jan 19, 2026"
 */
export function formatWeekRange(weekStart: Date, weekStartDay?: WeekStartDay): string {
  const weekEnd = endOfWeek(weekStart, getWeekOptions(weekStartDay));
  const startMonth = format(weekStart, 'MMM d');
  const endMonth = format(weekEnd, 'MMM d, yyyy');
  return `${startMonth} - ${endMonth}`;
}

/**
 * Format a month for display
 * e.g., "January 2026"
 */
export function formatMonth(date: Date): string {
  return format(date, 'MMMM yyyy');
}

/**
 * Check if two dates are the same day
 */
export { isSameDay, isToday, parseISO };

/**
 * Get day of week name (short)
 */
export function getDayName(date: Date): string {
  return format(date, 'EEE');
}

/**
 * Get day number
 */
export function getDayNumber(date: Date): number {
  return date.getDate();
}
