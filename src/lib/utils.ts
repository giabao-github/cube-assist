import { ClassValue, clsx } from "clsx";
import humanizeDuration from "humanize-duration";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const chunkArray = <T>(arr: T[], chunks: number): T[][] => {
  const result: T[][] = Array.from({ length: chunks }, () => []);
  arr.forEach((item, index) => {
    result[index % chunks].push(item);
  });
  return result;
};

export const normalizeInput = (name: string) =>
  name.trim().replace(/\s+/g, " ");

export const formatDuration = (seconds: number) => {
  return humanizeDuration(seconds * 1000, {
    largest: 1,
    round: true,
    units: ["h", "m", "s"],
  });
};

export function formatTime(
  isoString: string,
  options?: {
    showSeconds?: boolean;
    relativeThreshold?: number;
  },
): string {
  const { showSeconds = false, relativeThreshold = 60 } = options || {};

  const date = new Date(isoString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  const timeStr = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    ...(showSeconds && { second: "2-digit" }),
    hour12: true,
  });

  // Within threshold
  if (diffMinutes < relativeThreshold) {
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes === 1) return "1 minute ago";
    return `${diffMinutes} minutes ago`;
  }

  if (diffHours < 24) {
    if (diffHours === 1) return "1 hour ago";
    return `${diffHours} hours ago`;
  }

  // Today
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return `Today at ${timeStr}`;

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return `Yesterday at ${timeStr}`;

  // Far in the past
  const fullDate = date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `${fullDate} at ${timeStr}`;
}
