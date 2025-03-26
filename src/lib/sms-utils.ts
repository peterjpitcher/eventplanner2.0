/**
 * SMS utility functions for working with Twilio
 */

/**
 * Sends an SMS message via Twilio
 * @param to The recipient phone number in E.164 format
 * @param body The message content
 * @returns Result object with success status and message/error details
 */
export async function sendSMS(
  to: string,
  body: string
): Promise<{ success: boolean; message?: any; error?: any }> {
  try {
    // Check if SMS is enabled in the environment
    const { smsEnabled, message: configMessage } = await checkAndEnsureSmsConfig();
    
    if (!smsEnabled) {
      console.log(`SMS is disabled: ${configMessage}. SMS not sent.`);
      return { 
        success: false, 
        error: `SMS is disabled: ${configMessage}`
      };
    }
    
    // In development/test mode, don't actually send SMS
    if (process.env.NODE_ENV !== 'production' || process.env.SMS_SIMULATION === 'true') {
      console.log('SMS simulation mode active - not sending actual SMS');
      console.log(`Would send SMS to: ${to}`);
      console.log(`Message content: ${body}`);
      
      // Return a simulated success response
      return {
        success: true,
        message: {
          sid: `SIMULATED_SID_${Date.now()}`,
          status: 'simulated',
        },
      };
    }
    
    // For production, actually send via Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN; 
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Missing Twilio credentials in environment variables');
    }
    
    // Dynamic import to avoid loading in SSR context
    const twilio = await import('twilio');
    const client = twilio.default(accountSid, authToken);
    
    // Send the message
    const twilioMessage = await client.messages.create({
      body,
      from: fromNumber,
      to,
    });
    
    console.log(`SMS sent successfully to ${to}, SID: ${twilioMessage.sid}`);
    
    return {
      success: true,
      message: twilioMessage,
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error,
    };
  }
}

/**
 * Process a template with a templateId and data
 * @param templateId The ID of the template to use
 * @param data The data to populate the template with
 * @returns The processed template string
 */
export async function processTemplate(
  templateId: string,
  data: any
): Promise<string> {
  // Import template utilities
  const { getTemplateDetails, processTemplate: processTemplateContent } = await import('./templates');
  
  // Get the template content
  const template = await getTemplateDetails(templateId);
  
  if (!template) {
    throw new Error(`Template with ID ${templateId} not found`);
  }
  
  // Process the template with the provided data
  return processTemplateContent(template.content, data);
}

/**
 * Checks if SMS is enabled and properly configured
 * @returns Object with smsEnabled status and a message explaining the status
 */
export async function checkAndEnsureSmsConfig(): Promise<{ smsEnabled: boolean; message: string }> {
  // Check if SMS is globally enabled
  const smsEnabled = process.env.SMS_ENABLED === 'true';
  
  if (!smsEnabled) {
    return { smsEnabled: false, message: 'SMS is disabled in environment settings' };
  }
  
  // In development mode, check if we're in simulation mode
  if (process.env.NODE_ENV !== 'production' && process.env.SMS_SIMULATION === 'true') {
    return { smsEnabled: true, message: 'SMS is in simulation mode' };
  }
  
  // Check if Twilio credentials are configured
  const hasTwilioConfig = !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
  
  if (!hasTwilioConfig) {
    return { 
      smsEnabled: false, 
      message: 'Twilio credentials are not properly configured'
    };
  }
  
  // All checks passed
  return { 
    smsEnabled: true, 
    message: 'SMS is enabled and properly configured'
  };
} 