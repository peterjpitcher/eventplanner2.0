/**
 * SMS utility functions for sending messages via Twilio
 */

import { formatUKMobileNumber } from './phone-utils';
import { supabase } from './supabase';

// Twilio client types
interface TwilioMessage {
  sid: string;
  status: string;
  body: string;
  to: string;
  from: string;
  dateCreated: string;
  dateUpdated: string;
  errorCode?: string;
  errorMessage?: string;
}

interface TwilioError {
  status: number;
  message: string;
  code: string;
  moreInfo: string;
}

type TwilioResponse = {
  success: boolean;
  message: TwilioMessage | null;
  error: TwilioError | null;
};

/**
 * Send an SMS message using Twilio API
 */
export async function sendSMS(
  to: string, 
  body: string,
  from: string = process.env.TWILIO_PHONE_NUMBER || ''
): Promise<TwilioResponse> {
  try {
    // Ensure environment variables are set
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    if (!accountSid || !authToken || !from) {
      console.error('Missing Twilio credentials or phone number');
      return {
        success: false,
        message: null,
        error: {
          status: 500,
          message: 'Missing Twilio credentials or phone number',
          code: 'MISSING_CREDENTIALS',
          moreInfo: 'Please check environment variables'
        }
      };
    }

    // Format the phone number
    const formattedNumber = formatUKToE164(to);

    // Check for development mode
    if (process.env.NODE_ENV === 'development' && process.env.SMS_SIMULATION === 'true') {
      console.log(`[SMS SIMULATION] To: ${formattedNumber}, From: ${from}, Message: ${body}`);
      return {
        success: true,
        message: {
          sid: 'SIMULATED_SID_' + Date.now(),
          status: 'simulated',
          body,
          to: formattedNumber,
          from,
          dateCreated: new Date().toISOString(),
          dateUpdated: new Date().toISOString(),
        },
        error: null
      };
    }

    // Build status callback URL
    const statusCallbackUrl = `${appUrl}/api/webhooks/twilio/status`;

    // Real Twilio API call
    const twilioClient = require('twilio')(accountSid, authToken);
    
    const message = await twilioClient.messages.create({
      body,
      from,
      to: formattedNumber,
      statusCallback: statusCallbackUrl // Add status callback URL for delivery updates
    });

    return {
      success: true,
      message,
      error: null
    };
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      message: null,
      error: {
        status: error.status || 500,
        message: error.message || 'Unknown error',
        code: error.code || 'UNKNOWN_ERROR',
        moreInfo: error.moreInfo || ''
      }
    };
  }
}

/**
 * Format a UK mobile number to E.164 format for Twilio
 */
export function formatUKToE164(mobileNumber: string): string {
  // First standardize the format
  const standardized = formatUKMobileNumber(mobileNumber);

  // If starts with 0, replace with +44
  if (standardized.startsWith('0')) {
    return '+44' + standardized.substring(1);
  }

  // If no country code, assume UK and add +44
  if (!standardized.startsWith('+')) {
    return '+44' + standardized;
  }

  return standardized;
}

/**
 * Process an SMS template with variable replacements
 */
export function processTemplate(template: string, variables: Record<string, string | undefined>): string {
  let processed = template;
  
  // Replace all variables in the template
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(placeholder, value);
    }
  });

  return processed;
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