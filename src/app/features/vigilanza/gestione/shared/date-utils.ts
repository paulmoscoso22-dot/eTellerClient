/**
 * Utility function to convert Date or string to ISO date format (YYYY-MM-DD)
 * with proper validation and error handling.
 * 
 * @param d - Date object, ISO string, or null/undefined
 * @returns ISO date string (YYYY-MM-DD) or null if input is invalid
 * 
 * @example
 * toDateString(new Date(2026, 4, 29)) // → "2026-05-29"
 * toDateString("2026-05-29") // → "2026-05-29"
 * toDateString(null) // → null
 * toDateString("invalid") // → null
 */
export function toDateString(d: Date | string | null | undefined): string | null {
  // Handle null/undefined
  if (d === null || d === undefined) {
    return null;
  }

  try {
    // Convert to Date object
    const date = d instanceof Date ? d : new Date(d);

    // Validate date is not Invalid Date
    if (isNaN(date.getTime())) {
      return null;
    }

    // Format as YYYY-MM-DD with zero-padding
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    // Catch any unexpected errors
    return null;
  }
}
