/**
 * Phone number utility functions for formatting and validation
 */

/**
 * Format UK mobile number to E.164 format for Twilio
 * 
 * E.164 format example: +447123456789
 * 
 * Accepts:
 * - 07xxx xxxxxx
 * - 7xxx xxxxxx
 * - +447xxx xxxxxx
 * - 447xxx xxxxxx
 */
export function formatUKMobileNumber(phoneNumber: string): string | null {
  console.log('Formatting phone number:', phoneNumber);
  
  if (!phoneNumber) return null;
  
  // Remove spaces, dashes, and other non-digit or + characters
  const cleaned = phoneNumber.replace(/[^0-9+]/g, '');
  console.log('Cleaned phone number:', cleaned);
  
  // Already in E.164 format
  if (cleaned.startsWith('+44') && cleaned.length === 13) {
    console.log('Already in E.164 format');
    return cleaned;
  }
  
  // UK number starting with 44
  if (cleaned.startsWith('44') && cleaned.length === 12) {
    console.log('UK number starting with 44');
    return '+' + cleaned;
  }
  
  // UK mobile starting with 07
  if (cleaned.startsWith('07') && cleaned.length === 11) {
    console.log('UK mobile starting with 07');
    return '+44' + cleaned.substring(1);
  }
  
  // UK mobile starting with 7
  if (cleaned.startsWith('7') && cleaned.length === 10) {
    console.log('UK mobile starting with 7');
    return '+44' + cleaned;
  }
  
  // If it doesn't match any of these patterns but has a + assume it's an international number
  if (cleaned.startsWith('+') && cleaned.length > 8) {
    console.log('Assuming international format');
    return cleaned;
  }
  
  console.log('Invalid phone number format');
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

/**
 * Formats a phone number to ensure it has the correct format for SMS sending
 * 
 * @param phoneNumber The phone number to format
 * @returns The formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters except for the + symbol
  let formatted = phoneNumber.replace(/[^\d+]/g, '');
  
  // Ensure the number starts with a +
  if (!formatted.startsWith('+')) {
    // If it starts with a country code like 44, add the +
    if (formatted.startsWith('44')) {
      formatted = '+' + formatted;
    }
    // If it's a UK number starting with 0, replace with +44
    else if (formatted.startsWith('0')) {
      formatted = '+44' + formatted.substring(1);
    }
    // Default to adding +44 if no country code is detected
    else {
      formatted = '+44' + formatted;
    }
  }
  
  return formatted;
}

/**
 * Validates if a phone number is in a valid format for SMS
 * 
 * @param phoneNumber The phone number to validate
 * @returns Boolean indicating if the number is valid
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic validation - should start with + and have at least 10 digits
  const formatted = formatPhoneNumber(phoneNumber);
  const phoneRegex = /^\+\d{10,15}$/;
  return phoneRegex.test(formatted);
}

/**
 * Masks a phone number for display, hiding part of it for privacy
 * 
 * @param phoneNumber The phone number to mask
 * @returns The masked phone number
 */
export function maskPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  const formatted = formatPhoneNumber(phoneNumber);
  // Keep the country code and last 4 digits, mask the rest
  const lastFour = formatted.slice(-4);
  const countryCodeEndIndex = formatted.startsWith('+') ? 3 : 0;
  const countryCode = formatted.substring(0, countryCodeEndIndex);
  
  // Create the masked section
  const maskLength = formatted.length - countryCodeEndIndex - 4;
  const maskedSection = '*'.repeat(Math.max(2, maskLength));
  
  return `${countryCode}${maskedSection}${lastFour}`;
} 