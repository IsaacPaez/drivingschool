// Helper function to format date correctly without timezone issues
export const formatDateForDisplay = (dateString: string): string => {
  try {
    // Handle different date formats
    let dateStr = dateString;
    
    // If it's an ISO date with time, extract just the date part
    if (dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }
    
    // Parse the date string correctly to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return dateString; // Return original string if parsing fails
  }
};

// Helper function to convert 24-hour time format to 12-hour format
export const formatTo12Hour = (time24: string): string => {
  if (!time24 || typeof time24 !== 'string') return time24;
  
  try {
    const [hoursStr, minutesStr] = time24.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr || '00';
    
    if (isNaN(hours)) return time24;
    
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12, and 13-23 to 1-11
    
    return `${hours}:${minutes} ${period}`;
  } catch {
    return time24;
  }
};

// Helper function to format a time range in 12-hour format
export const formatTimeRange12Hour = (start: string, end: string): string => {
  return `${formatTo12Hour(start)} - ${formatTo12Hour(end)}`;
};
