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
