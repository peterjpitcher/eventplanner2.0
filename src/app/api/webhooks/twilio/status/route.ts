import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * This endpoint handles Twilio status callback webhooks
 * Twilio will call this endpoint with status updates for sent messages
 */
export async function POST(req: NextRequest) {
  try {
    // Verify that the request is from Twilio
    // This would typically include validation of the Twilio signature
    // See: https://www.twilio.com/docs/usage/webhooks/webhooks-security
    
    // For now, we'll skip signature validation for simplicity
    // In a production environment, you should validate the request

    // Parse the form data
    const formData = await req.formData();
    const messageSid = formData.get('MessageSid') as string;
    const messageStatus = formData.get('MessageStatus') as string;
    
    // Skip processing if required fields are missing
    if (!messageSid || !messageStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Valid Twilio status values:
    // queued, failed, sent, delivered, undelivered
    const validStatuses = ['queued', 'failed', 'sent', 'delivered', 'undelivered'];
    if (!validStatuses.includes(messageStatus)) {
      return NextResponse.json(
        { error: 'Invalid message status' },
        { status: 400 }
      );
    }

    // Update the message status in the database
    // We need to find the message by the Twilio message SID stored in the database
    const { error } = await supabase
      .from('sms_messages')
      .update({ status: messageStatus })
      .eq('message_sid', messageSid);

    if (error) {
      console.error('Error updating message status:', error);
      return NextResponse.json(
        { error: 'Failed to update message status' },
        { status: 500 }
      );
    }

    // Return a success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in Twilio status webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 