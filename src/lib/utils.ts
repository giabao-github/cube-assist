import { ClassValue, clsx } from "clsx";
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
