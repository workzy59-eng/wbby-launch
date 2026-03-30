import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: any, formatStr: string = 'PPP'): string {
  if (!date) return 'N/A';
  
  let d: Date;
  
  if (date instanceof Timestamp) {
    d = date.toDate();
  } else if (typeof date === 'string' || typeof date === 'number') {
    d = new Date(date);
  } else if (date instanceof Date) {
    d = date;
  } else if (date && typeof date === 'object' && 'seconds' in date) {
    // Handle plain objects that look like Timestamps (sometimes happens with JSON serialization)
    d = new Date(date.seconds * 1000);
  } else {
    return 'Invalid Date';
  }

  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  return format(d, formatStr);
}
