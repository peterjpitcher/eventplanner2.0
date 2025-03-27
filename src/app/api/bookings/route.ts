import { NextRequest, NextResponse } from 'next/server';
import { smsService } from '@/services/sms-service';

// A simple mock function to simulate booking creation
async function mockCreateBooking(bookingData: any) {
  console.log('MOCK: Creating booking with data:', bookingData);
  
  // Generate a random ID for the booking
  const bookingId = `booking-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Return a successful result with the mock booking data
  return {
    data: {
      id: bookingId,
      ...bookingData,
      created_at: new Date().toISOString()
    },
    error: null
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('Received booking creation request');
    
    // Parse the request body
    const body = await request.json();
    console.log('Booking creation request body:', body);

    // Validate required fields
    if (!body.event_id || !body.customer_id) {
      return NextResponse.json(
        { error: 'Missing required fields: event_id and customer_id are required' },
        { status: 400 }
      );
    }

    // Format the booking data
    const bookingData = {
      event_id: body.event_id,
      customer_id: body.customer_id,
      seats_or_reminder: body.seats?.toString() || '1', // Default to 1 seat if not specified
      notes: body.notes || null,
      send_notification: body.sendNotification === undefined ? true : !!body.sendNotification
    };

    console.log('Creating booking with data:', bookingData);

    // Use the mock booking creation function instead of actual service
    const { data: booking, error } = await mockCreateBooking(bookingData);

    if (error) {
      console.error('Error creating booking:', error);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    console.log('Booking created successfully:', booking);

    // Send confirmation SMS if requested
    if (bookingData.send_notification && booking?.id) {
      try {
        console.log('Sending test SMS notification for booking confirmation...');
        
        // Use the smsService to send a test message instead of booking confirmation
        const smsResult = await smsService.sendTestMessage(
          '+447123456789', // Use a test phone number
          `Test booking confirmation for Booking ID: ${booking.id}`
        );
        
        if (!smsResult.success) {
          console.warn('Failed to send test SMS:', smsResult.error);
        } else {
          console.log('Test SMS sent successfully');
        }
      } catch (smsError) {
        console.error('Error sending test SMS:', smsError);
        // Don't fail the booking creation if SMS fails
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Booking created successfully',
      booking 
    });
  } catch (error) {
    console.error('Unexpected error in booking creation:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 