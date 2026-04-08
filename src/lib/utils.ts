import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateLevel(score: number, thresholdsStr: string): number {
  try {
    const thresholds = thresholdsStr.split(',').map(n => parseInt(n.trim(), 10));
    let level = 0;
    for (let i = 0; i < thresholds.length; i++) {
      if (score >= thresholds[i]) {
        level = i + 1;
      } else {
        break;
      }
    }
    return level;
  } catch (e) {
    console.error("Failed to parse thresholds string", e);
    return 0;
  }
}
