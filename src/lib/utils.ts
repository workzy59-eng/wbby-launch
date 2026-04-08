import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isYesterday, startOfDay } from 'date-fns';
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
    d = new Date(date.seconds * 1000);
  } else {
    return 'Invalid Date';
  }

  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  if (formatStr === 'chat') {
    if (isToday(d)) return format(d, 'h:mm a');
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM d, yyyy');
  }

  if (formatStr === 'separator') {
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMMM d, yyyy');
  }

  return format(d, formatStr);
}

export function isSameDay(date1: any, date2: any): boolean {
  const d1 = date1 instanceof Timestamp ? date1.toDate() : new Date(date1);
  const d2 = date2 instanceof Timestamp ? date2.toDate() : new Date(date2);
  return startOfDay(d1).getTime() === startOfDay(d2).getTime();
}
