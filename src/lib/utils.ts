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
