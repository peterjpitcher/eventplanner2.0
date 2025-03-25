import { NextRequest, NextResponse } from 'next/server';
import { reminderService } from '@/services/reminder-service';

/**
 * Process pending reminders - both 7-day and 24-hour
 * This endpoint is designed to be called by a scheduled task/cron job
 */
export async function POST(req: NextRequest) {
  try {
    // Check for API key authorization (in a production app, you'd validate an API key here)
    const authHeader = req.headers.get('authorization');
    
    // Simple key validation - in production, use a secure method
    // Extract API key from "Bearer <key>"
    const apiKey = process.env.REMINDER_API_KEY;
    const providedKey = authHeader?.replace('Bearer ', '');
    
    // Skip validation in development mode if configured
    const skipAuth = process.env.NODE_ENV === 'development' && process.env.SKIP_REMINDER_AUTH === 'true';
    
    if (!skipAuth && (!apiKey || !providedKey || apiKey !== providedKey)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Process reminders
    const result = await reminderService.processReminders();

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to process reminders', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      processed: result.processed,
      skipped: result.skipped,
      failed: result.failed
    });
  } catch (error) {
    console.error('Unexpected error processing reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Allow GET requests for simple health checks/debugging
 */
export async function GET() {
  return NextResponse.json({
    status: 'Reminder service is online',
    info: 'Use POST to trigger reminder processing'
  });
} 