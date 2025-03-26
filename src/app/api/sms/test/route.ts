import { NextResponse } from 'next/server';
import { sendSMS, checkAndEnsureSmsConfig } from '@/lib/sms-utils';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { phoneNumber, messageContent } = body;
    
    if (!phoneNumber || !messageContent) {
      return NextResponse.json(
        { success: false, error: 'Phone number and message content are required' },
        { status: 400 }
      );
    }
    
    console.log(`Test SMS request: To: ${phoneNumber}, Content: ${messageContent.substring(0, 30)}...`);
    
    // Check if SMS is enabled
    const { smsEnabled, message: configMessage } = await checkAndEnsureSmsConfig();
    
    if (!smsEnabled) {
      console.log(`SMS is disabled: ${configMessage}. Test message not sent.`);
      return NextResponse.json(
        { 
          success: false, 
          error: `SMS is disabled: ${configMessage}` 
        },
        { status: 400 }
      );
    }
    
    // Send the message
    const result = await sendSMS(phoneNumber, messageContent);
    
    // Log the test message to the database
    try {
      await supabase.from('sms_messages').insert({
        customer_id: null, // No customer for test messages
        booking_id: null, // No booking for test messages
        message_type: 'test',
        content: messageContent,
        phone_number: phoneNumber,
        sent_at: new Date().toISOString(),
        status: result.success ? 'sent' : 'failed',
        message_sid: result.message?.sid || null,
        error: result.success ? null : JSON.stringify(result.error)
      });
      
      console.log('SMS test message logged to database');
    } catch (logError) {
      console.error('Error logging test message to database:', logError);
      // Don't fail the overall operation just because logging failed
    }
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      });
    } else {
      return NextResponse.json({
        success: false,
        error: typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to send SMS'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in SMS test endpoint:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 