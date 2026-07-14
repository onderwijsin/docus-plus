import type { ClassValue } from "clsx";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and merges them with tailwind-merge.
 * @param inputs - An array of class values to be combined and merged.
 * @returns {string} The combined and merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
