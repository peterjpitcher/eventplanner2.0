/**
 * Phone number utility functions for formatting and validation
 */

/**
 * Format a UK mobile number to a standard format
 * Removes spaces, dashes, and other non-numeric characters
 * Ensures 11-digit format starting with '07' (for UK)
 */
export function formatUKMobileNumber(phoneNumber: string): string | null {
  if (!phoneNumber) return null;
  
  // Remove all non-digit characters except the plus sign
  const sanitized = phoneNumber.replace(/[^\d+]/g, '');
  
  // Handle different UK mobile number formats
  if (sanitized.length === 10 && sanitized.startsWith('07')) {
    // Convert 07XXXXXXXXX to +447XXXXXXXXX
    return '+44' + sanitized.substring(1);
  } else if (sanitized.length === 11 && sanitized.startsWith('447')) {
    // Convert 447XXXXXXXXX to +447XXXXXXXXX
    return '+' + sanitized;
  } else if (sanitized.length === 12 && sanitized.startsWith('4407')) {
    // Convert 4407XXXXXXXXX to +447XXXXXXXXX (sometimes people include the 0)
    return '+44' + sanitized.substring(3);
  } else if (sanitized.length === 13 && sanitized.startsWith('00447')) {
    // Convert 00447XXXXXXXXX to +447XXXXXXXXX
    return '+' + sanitized.substring(2);
  } else if (sanitized.startsWith('+44') && (sanitized.length === 13 || sanitized.length === 14)) {
    // Already in international format, just return as is
    return sanitized;
  } else if (sanitized.startsWith('+') && sanitized.length >= 11 && sanitized.length <= 15) {
    // Other international format, assume it's correct
    return sanitized;
  }
  
  // Not a valid mobile number format
  return null;
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