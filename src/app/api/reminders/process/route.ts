import { NextRequest, NextResponse } from 'next/server';
import { reminderService } from '@/services/reminder-service';
import { createLogger } from '@/lib/logger';
import { validateApiAuthToken } from '@/lib/api-auth';

const logger = createLogger('reminders-api');

/**
 * Process pending reminders - both 7-day and 24-hour
 * This endpoint is designed to be called by a scheduled task/cron job
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Validate API token
    const authHeader = req.headers.get('authorization');
    if (!validateApiAuthToken(authHeader)) {
      logger.warn('Unauthorized reminder processing attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Process reminders
    logger.info('Starting scheduled reminder processing');
    const result = await reminderService.processReminders();

    if (result.success) {
      const summary = result.results.map(r => ({
        type: r.type,
        processed: r.processed,
        sent: r.sent,
        failed: r.failed,
        skipped: r.skipped,
      }));

      logger.info('Reminder processing complete', { summary });
      return NextResponse.json({
        success: true,
        results: summary,
        timestamp: new Date().toISOString()
      });
    } else {
      logger.error('Error during reminder processing:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error processing reminders',
          details: result.error?.message || 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    logger.error('Unexpected error in reminder processing endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unexpected error while processing reminders',
        details: error?.message || 'Unknown error'
      },
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