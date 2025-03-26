import { format, parseISO } from 'date-fns';

/**
 * Standard date format: "MMMM DD" (e.g., "January 1")
 * @param dateString - ISO date string
 */
export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'MMMM d');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format date with year: "MMMM DD, YYYY" (e.g., "January 1, 2023")
 * @param dateString - ISO date string
 */
export const formatDateWithYear = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'MMMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date with year:', error);
    return dateString;
  }
};

/**
 * Standard time format: 12-hour clock (e.g., "9 PM")
 * @param timeString - Time string (HH:MM:SS format)
 */
export const formatTime = (timeString: string): string => {
  try {
    // Create a date with the time string to format it
    const date = parseISO(`2000-01-01T${timeString}`);
    return format(date, 'h a').toUpperCase(); // "9 PM"
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

/**
 * Standard time format with minutes: 12-hour clock (e.g., "9:30 PM")
 * @param timeString - Time string (HH:MM:SS format)
 */
export const formatTimeWithMinutes = (timeString: string): string => {
  try {
    // Create a date with the time string to format it
    const date = parseISO(`2000-01-01T${timeString}`);
    return format(date, 'h:mm a').toUpperCase(); // "9:30 PM"
  } catch (error) {
    console.error('Error formatting time with minutes:', error);
    return timeString;
  }
};

/**
 * Format date and time: "MMMM DD at HH AM/PM"
 * @param dateString - ISO date string
 * @param timeString - Time string (HH:MM:SS format)
 */
export const formatDateAndTime = (dateString: string, timeString: string): string => {
  try {
    const formattedDate = formatDate(dateString);
    const formattedTime = formatTime(timeString);
    return `${formattedDate} at ${formattedTime}`;
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return `${dateString} ${timeString}`;
  }
};

/**
 * Format ISO datetime string to date and time
 * @param datetimeString - ISO datetime string
 */
export const formatDateTime = (datetimeString: string): string => {
  try {
    const date = parseISO(datetimeString);
    return `${format(date, 'MMMM d')} at ${format(date, 'h a').toUpperCase()}`;
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return datetimeString;
  }
};

/**
 * Format ISO datetime string to full date and time with minutes
 * @param datetimeString - ISO datetime string
 */
export const formatDateTimeWithMinutes = (datetimeString: string): string => {
  try {
    const date = parseISO(datetimeString);
    return `${format(date, 'MMMM d, yyyy')} at ${format(date, 'h:mm a').toUpperCase()}`;
  } catch (error) {
    console.error('Error formatting datetime with minutes:', error);
    return datetimeString;
  }
};

/**
 * Calculate duration between two time strings in minutes
 */
export function calculateDuration(startTime: string, endTime: string): number | null {
  if (!startTime || !endTime) return null;
  
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  // Handle case where end time is on the next day
  if (endTotalMinutes < startTotalMinutes) {
    return (24 * 60 - startTotalMinutes) + endTotalMinutes;
  }
  
  return endTotalMinutes - startTotalMinutes;
}

/**
 * Format minutes to hours and minutes
 */
export function formatDuration(minutes: number): string {
  if (!minutes && minutes !== 0) return '';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes} min`;
  } else if (remainingMinutes === 0) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  } else {
    return `${hours} hr ${remainingMinutes} min`;
  }
}