import { NextResponse } from 'next/server';
import { checkAndEnsureSmsConfig } from '@/lib/sms-utils';

export async function GET() {
  try {
    const result = await checkAndEnsureSmsConfig();
    
    // Return config data with masked credentials
    return NextResponse.json({
      success: true,
      smsEnabled: result.smsEnabled,
      message: result.message,
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ? 
        `${process.env.TWILIO_ACCOUNT_SID.substring(0, 8)}...` : undefined,
      twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ? true : undefined,
      twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || undefined
    });
  } catch (error: any) {
    console.error('Error checking SMS config:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check SMS configuration',
        smsEnabled: false
      }, 
      { status: 500 }
    );
  }
} 