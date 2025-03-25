/**
 * Formats a date string (YYYY-MM-DD) and time string (HH:MM) into a human-readable format
 */
export function formatDateTime(dateStr: string, timeStr: string): string {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  
  // Format date
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  
  const formattedDate = date.toLocaleDateString('en-GB', dateOptions);
  
  // Format time if provided
  if (timeStr) {
    return `${formattedDate} at ${formatTime(timeStr)}`;
  }
  
  return formattedDate;
}

/**
 * Formats a time string (HH:MM) into a more readable format
 */
export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  
  // Parse hours and minutes
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Convert to 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  
  // Format with leading zeros for minutes
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

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