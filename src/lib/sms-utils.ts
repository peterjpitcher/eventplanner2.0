/**
 * SMS utility functions for sending messages via Twilio
 */

import { formatUKMobileNumber } from './phone-utils';
import { supabase } from './supabase';

// Twilio client types
type TwilioMessage = {
  sid: string;
  status: string;
  dateCreated: Date;
  to: string;
  from: string;
  body: string;
  errorMessage?: string;
  errorCode?: string;
};

// Cached Twilio client
let twilioClient: any = null;

// Get Twilio client with proper initialization
function getTwilioClient() {
  if (twilioClient) return twilioClient;
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured');
  }
  
  // Import Twilio dynamically to avoid issues with server components
  const twilio = require('twilio');
  twilioClient = twilio(accountSid, authToken);
  return twilioClient;
}

/**
 * Send an SMS message using Twilio
 */
export async function sendSMS(
  to: string,
  body: string
): Promise<{ success: boolean; message?: TwilioMessage; error?: any }> {
  try {
    console.log(`Preparing to send SMS to ${to}`);
    
    // First check if SMS is enabled
    const { smsEnabled, message: configMessage } = await checkAndEnsureSmsConfig();
    
    if (!smsEnabled) {
      console.log(`SMS is disabled: ${configMessage}. Simulating success.`);
      return {
        success: true,
        message: {
          sid: `SIMULATED_${Date.now()}`,
          status: 'simulated',
          dateCreated: new Date(),
          to,
          from: 'SIMULATOR',
          body
        }
      };
    }
    
    // Format the recipient's phone number to E.164 format
    const formattedNumber = formatUKMobileNumber(to);
    if (!formattedNumber) {
      console.error(`Invalid phone number format: ${to}`);
      return {
        success: false,
        error: `Invalid phone number format: ${to}`
      };
    }
    
    // Get the sender's phone number
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!fromNumber) {
      console.error('Twilio phone number not configured');
      return {
        success: false,
        error: 'Twilio phone number not configured'
      };
    }
    
    console.log(`Sending SMS from ${fromNumber} to ${formattedNumber}`);
    
    try {
      // Get Twilio client and send message
      const client = getTwilioClient();
      
      const message = await client.messages.create({
        body,
        from: fromNumber,
        to: formattedNumber
      });
      
      console.log(`Message sent with SID: ${message.sid}, Status: ${message.status}`);
      
      return {
        success: true,
        message
      };
    } catch (twilioError: any) {
      // Handle Twilio-specific errors
      console.error('Twilio error sending SMS:', twilioError);
      
      // Format error message for user feedback
      const errorMessage = twilioError.message || 'Unknown Twilio error';
      const errorCode = twilioError.code || 'UNKNOWN';
      
      return {
        success: false,
        error: {
          message: `Failed to send SMS: ${errorMessage}`,
          code: errorCode,
          details: twilioError
        }
      };
    }
  } catch (error: any) {
    console.error('Unexpected error sending SMS:', error);
    return {
      success: false,
      error: {
        message: `Unexpected error: ${error.message || 'Unknown error'}`,
        details: error
      }
    };
  }
}

/**
 * Process a template string with placeholder values
 */
export function processTemplate(template: string, values: Record<string, string | number>): string {
  let processed = template;
  
  // Replace each placeholder with its value
  for (const [key, value] of Object.entries(values)) {
    const placeholder = `{${key}}`;
    processed = processed.replace(new RegExp(placeholder, 'g'), String(value));
  }
  
  return processed;
}

/**
 * Test Twilio connection without sending an actual message
 */
export async function testTwilioConnection(): Promise<{ success: boolean; message?: string; error?: any }> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      return {
        success: false,
        error: 'Missing Twilio credentials'
      };
    }
    
    try {
      // Get account info instead of sending a message
      const client = getTwilioClient();
      const account = await client.api.accounts(accountSid).fetch();
      
      return {
        success: true,
        message: `Connected to Twilio account: ${account.friendlyName || account.sid}`
      };
    } catch (twilioError: any) {
      // Handle Twilio-specific errors
      return {
        success: false,
        error: `Twilio authentication failed: ${twilioError.message || 'Unknown Twilio error'}`
      };
    }
  } catch (error: any) {
    console.error('Error testing Twilio connection:', error);
    return {
      success: false,
      error: `Unexpected error: ${error.message || 'Unknown error'}`
    };
  }
}

/**
 * Check if SMS is enabled in the system and create config row if it doesn't exist
 */
export async function checkAndEnsureSmsConfig(): Promise<{ smsEnabled: boolean; message: string }> {
  try {
    // Ensure environment variables are set
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    console.log('SMS check - ENV vars:', {
      hasSid: !!accountSid,
      hasToken: !!authToken,
      hasPhone: !!phoneNumber,
      smsEnabled: process.env.SMS_ENABLED
    });
    
    // First check if the SMS_ENABLED app config exists
    const { data: configData, error: configError } = await supabase
      .from('app_config')
      .select('*')
      .eq('key', 'sms_enabled')
      .single();
    
    if (configError && configError.code !== 'PGRST116') {
      // If there's an error other than "not found"
      console.error('Error fetching SMS config:', configError);
      return { 
        smsEnabled: process.env.SMS_ENABLED === 'true',
        message: 'Error checking SMS configuration' 
      };
    }
    
    // If config doesn't exist, create it based on env var
    if (!configData || configError?.code === 'PGRST116') {
      console.log('Creating SMS config in database');
      const isEnabled = !!(accountSid && authToken && phoneNumber && process.env.SMS_ENABLED === 'true');
      
      await supabase
        .from('app_config')
        .upsert({ 
          key: 'sms_enabled',
          value: isEnabled ? 'true' : 'false',
          description: 'Whether SMS notifications are enabled'
        });
      
      return { 
        smsEnabled: isEnabled,
        message: `SMS ${isEnabled ? 'enabled' : 'disabled'} and configuration created` 
      };
    }
    
    // Config exists, use it
    const smsEnabled = configData.value === 'true';
    
    // Update config if env vars don't support SMS but config says it's enabled
    if (smsEnabled && (!accountSid || !authToken || !phoneNumber || process.env.SMS_ENABLED !== 'true')) {
      console.log('SMS environment variables missing, updating config to disabled');
      
      await supabase
        .from('app_config')
        .update({ value: 'false' })
        .eq('key', 'sms_enabled');
      
      return { 
        smsEnabled: false,
        message: 'SMS disabled due to missing configuration' 
      };
    }
    
    return {
      smsEnabled,
      message: `SMS is ${smsEnabled ? 'enabled' : 'disabled'}`
    };
  } catch (error) {
    console.error('Error in SMS config check:', error);
    return {
      smsEnabled: false,
      message: 'Error checking SMS configuration'
    };
  }
} 