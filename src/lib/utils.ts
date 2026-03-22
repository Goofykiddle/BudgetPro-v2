import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency in the format [+/-]₪[amount]
 * Uses LRM (\u200E) to ensure correct positioning in RTL contexts.
 */
export function formatCurrency(amount: number, forceSign: boolean = false) {
  const absAmount = Math.abs(amount).toLocaleString();
  const sign = amount > 0 ? (forceSign ? '+' : '') : (amount < 0 ? '-' : '');
  return `\u200E${sign}₪${absAmount}`;
}

/**
 * Formats a Date object as YYYY-MM-DD in local time.
 */
export function formatDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string as a Date object at local midnight.
 */
export function parseDateLocal(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}
