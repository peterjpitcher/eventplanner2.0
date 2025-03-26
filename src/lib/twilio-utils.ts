/**
 * Utility functions for Twilio debugging
 */

/**
 * Check for Twilio environment variables and return their status
 */
export function checkTwilioEnvironment() {
  try {
    const env = {
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
      SMS_ENABLED: process.env.SMS_ENABLED,
    };
    
    const status = {
      hasSid: !!env.TWILIO_ACCOUNT_SID,
      hasToken: !!env.TWILIO_AUTH_TOKEN,
      hasPhone: !!env.TWILIO_PHONE_NUMBER,
      smsEnabled: env.SMS_ENABLED === 'true',
      sidPrefix: env.TWILIO_ACCOUNT_SID ? env.TWILIO_ACCOUNT_SID.substring(0, 5) + '...' : 'not set',
      phoneNumber: env.TWILIO_PHONE_NUMBER || 'not set',
    };
    
    return {
      success: true,
      env, 
      status,
      allRequired: status.hasSid && status.hasToken && status.hasPhone,
      isEnabled: status.hasSid && status.hasToken && status.hasPhone && status.smsEnabled
    };
  } catch (error: any) {
    console.error('Error checking Twilio environment:', error);
    return {
      success: false,
      error: error.message || 'Unknown error checking Twilio environment'
    };
  }
}

/**
 * Initialize Twilio client for testing
 */
export async function initializeTwilioClient() {
  try {
    const envCheck = checkTwilioEnvironment();
    
    if (!envCheck.success || !envCheck.allRequired) {
      return { 
        success: false, 
        error: 'Missing required Twilio environment variables'
      };
    }
    
    // Import Twilio dynamically to avoid issues with server components
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    return { 
      success: true,
      client,
      message: 'Twilio client initialized successfully'
    };
  } catch (error: any) {
    console.error('Error initializing Twilio client:', error);
    return {
      success: false,
      error: error.message || 'Unknown error initializing Twilio client'
    };
  }
} 