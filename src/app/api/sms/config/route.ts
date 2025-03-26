import { NextResponse } from 'next/server';
import { checkAndEnsureSmsConfig } from '@/lib/sms-utils';
import { checkTwilioEnvironment } from '@/lib/twilio-utils';

export async function GET() {
  try {
    // Check environment variables directly
    const envCheck = checkTwilioEnvironment();
    console.log('Twilio environment check:', envCheck);
    
    // Also run the SMS config check for comparison
    const smsConfigResult = await checkAndEnsureSmsConfig();
    console.log('SMS config result:', smsConfigResult);
    
    // Return combined results
    return NextResponse.json({
      success: true,
      smsEnabled: smsConfigResult.smsEnabled,
      message: smsConfigResult.message,
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ? 
        `${process.env.TWILIO_ACCOUNT_SID.substring(0, 8)}...` : undefined,
      twilioAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
      twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || undefined,
      envDetails: envCheck.success ? envCheck.status : undefined,
      envEnabled: envCheck.success ? envCheck.isEnabled : false
    });
  } catch (error: any) {
    console.error('Error checking SMS config:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check SMS configuration',
        errorMessage: error.message,
        smsEnabled: false
      }, 
      { status: 500 }
    );
  }
} 