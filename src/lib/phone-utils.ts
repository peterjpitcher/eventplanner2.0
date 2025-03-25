/**
 * Phone number utility functions for formatting and validation
 */

/**
 * Format a UK mobile number to a standard format
 * Removes spaces, dashes, and other non-numeric characters
 * Ensures 11-digit format starting with '07' (for UK)
 */
export function formatUKMobileNumber(mobileNumber: string): string {
  if (!mobileNumber) return '';

  // Remove all non-numeric characters
  const numericOnly = mobileNumber.replace(/[^0-9+]/g, '');

  // Process different formats
  // Handle international +44 format (e.g., +447123456789)
  if (numericOnly.startsWith('+44') && numericOnly.length === 13) {
    return '0' + numericOnly.substring(3); // Convert to 07XXXXXXXXX
  }

  // Handle international 44 format without + (e.g., 447123456789)
  if (numericOnly.startsWith('44') && numericOnly.length === 12) {
    return '0' + numericOnly.substring(2); // Convert to 07XXXXXXXXX
  }

  // Return as is if it already starts with 07 and has 11 digits
  if (numericOnly.startsWith('07') && numericOnly.length === 11) {
    return numericOnly;
  }

  // If none of the formats match, return original input
  return mobileNumber;
}

/**
 * Validate that a string is a valid UK mobile number
 * Valid formats:
 * - 07XXX XXXXXX (standard UK format)
 * - +447XXX XXXXXX (international format)
 * - 447XXX XXXXXX (international format without +)
 */
export function isValidUKMobileNumber(mobileNumber: string): boolean {
  if (!mobileNumber) return false;

  // Remove all non-numeric characters for validation
  const numericOnly = mobileNumber.replace(/[^0-9+]/g, '');

  // Check standard UK format: 07XXXXXXXXX (11 digits starting with 07)
  if (numericOnly.startsWith('07') && numericOnly.length === 11) {
    return true;
  }

  // Check international format with +: +447XXXXXXXXX (13 characters starting with +447)
  if (numericOnly.startsWith('+447') && numericOnly.length === 13) {
    return true;
  }

  // Check international format without +: 447XXXXXXXXX (12 digits starting with 447)
  if (numericOnly.startsWith('447') && numericOnly.length === 12) {
    return true;
  }

  return false;
} 