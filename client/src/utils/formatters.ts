import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number, digits = 0) {
  return `${value.toFixed(digits)}%`;
}

export function formatShortDate(date: string | Date) {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  return isValid(parsed) ? format(parsed, "MMM d, HH:mm") : "";
}

export function timeAgo(date: string | Date) {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  return isValid(parsed) ? `${formatDistanceToNowStrict(parsed)} ago` : "";
}

export function minutesUntil(date: string) {
  return Math.round((new Date(date).getTime() - Date.now()) / 60000);
}
