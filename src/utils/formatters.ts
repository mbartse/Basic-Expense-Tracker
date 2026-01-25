import { CURRENCY_LOCALE, CURRENCY_CODE } from '../constants/config';

/**
 * Format cents to currency string
 * e.g., 2550 -> "$25.50"
 */
export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: CURRENCY_CODE,
  }).format(dollars);
}

/**
 * Parse dollar string to cents
 * e.g., "25.50" -> 2550
 */
export function parseToCents(dollarString: string): number {
  const cleaned = dollarString.replace(/[^0-9.]/g, '');
  const dollars = parseFloat(cleaned);
  if (isNaN(dollars)) return 0;
  return Math.round(dollars * 100);
}

/**
 * Format date for display
 * e.g., "Wednesday, January 15"
 */
export function formatDateFull(date: Date): string {
  return date.toLocaleDateString(CURRENCY_LOCALE, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date short
 * e.g., "Jan 15"
 */
export function formatDateShort(date: Date): string {
  return date.toLocaleDateString(CURRENCY_LOCALE, {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time
 * e.g., "2:30 PM"
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString(CURRENCY_LOCALE, {
    hour: 'numeric',
    minute: '2-digit',
  });
}
