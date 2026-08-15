import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merges Tailwind CSS class names safely, resolving conflicts (e.g. 'p-2 p-4' → 'p-4').
export function mergeClasses(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
