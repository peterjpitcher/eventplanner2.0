import { NextRequest, NextResponse } from 'next/server';
import { sendSMS } from '@/lib/sms-utils';

// This endpoint is for development testing only
// It should be disabled or protected in production

export async function GET(req: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Endpoint only available in development' }, { status: 403 });
  }

  // Get test parameters from query string
  const { searchParams } = new URL(req.url);
  const to = searchParams.get('to');
  const body = searchParams.get('body') || 'This is a test message from Event Planner!';

  // Require a 'to' parameter
  if (!to) {
    return NextResponse.json({ error: 'Missing "to" parameter' }, { status: 400 });
  }

  try {
    // Send the test SMS
    const result = await sendSMS(to, body);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      error: result.error
    });
  } catch (error) {
    console.error('Error sending test SMS:', error);
    return NextResponse.json({ error: 'Failed to send test SMS' }, { status: 500 });
  }
} 