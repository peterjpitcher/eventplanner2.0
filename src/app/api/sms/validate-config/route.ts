import { NextResponse } from 'next/server';
import { testTwilioConnection } from '@/lib/sms-utils';

export async function GET() {
  try {
    const result = await testTwilioConnection();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error validating Twilio configuration:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to validate Twilio configuration: ${error.message || 'Unknown error'}`
      }, 
      { status: 500 }
    );
  }
} 