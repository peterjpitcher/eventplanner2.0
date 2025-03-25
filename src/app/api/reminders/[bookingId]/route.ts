import { NextRequest, NextResponse } from 'next/server';
import { reminderService } from '@/services/reminder-service';

interface Params {
  bookingId: string;
}

/**
 * Send a reminder for a specific booking
 * POST /api/reminders/:bookingId
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    // Get the booking ID from the URL parameter
    const { bookingId } = params;
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Parse request body to get the reminder type
    const body = await req.json();
    const { reminderType } = body;
    
    if (!reminderType || !['7day', '24hr'].includes(reminderType)) {
      return NextResponse.json(
        { error: 'Valid reminderType (7day or 24hr) is required' },
        { status: 400 }
      );
    }

    // Send the reminder
    const result = await reminderService.sendBookingReminder(bookingId, reminderType);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send reminder' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${reminderType} reminder sent successfully`
    });
  } catch (error) {
    console.error('Unexpected error sending reminder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 