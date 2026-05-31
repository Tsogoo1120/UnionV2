import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind classes safely, deduping conflicting utilities.
 * Used across components for conditional styling.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number with Mongolian locale grouping (e.g. 50000 → "50,000").
 * Used for payment amounts, coaching prices, etc.
 */
export function formatMNT(value: number): string {
  return value.toLocaleString("mn-MN");
}

/**
 * Formats a date string (ISO) as a readable Mongolian date.
 * Falls back to ISO if the input is null/invalid.
 */
export function formatDate(input: string | null | undefined): string {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Computes days remaining between now and a future ISO date.
 * Returns 0 if the date is in the past or invalid.
 */
export function daysUntil(input: string | null | undefined): number {
  if (!input) return 0;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return 0;
  const diffMs = d.getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
