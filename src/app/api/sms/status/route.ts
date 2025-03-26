import { NextResponse } from 'next/server';
import { checkAndEnsureSmsConfig } from '@/lib/sms-utils';

export async function GET() {
  try {
    const result = await checkAndEnsureSmsConfig();
    
    return NextResponse.json({
      success: true,
      smsEnabled: result.smsEnabled,
      message: result.message
    });
  } catch (error) {
    console.error('Error checking SMS status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check SMS status',
        smsEnabled: false
      }, 
      { status: 500 }
    );
  }
} 