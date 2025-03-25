import { NextRequest, NextResponse } from 'next/server';
import { smsService } from '@/services/sms-service';
import { formatUKMobileNumber } from '@/lib/phone-utils';

export async function POST(req: NextRequest) {
  try {
    // Verify that the request is from Twilio
    // This would typically include validation of the Twilio signature
    // See: https://www.twilio.com/docs/usage/webhooks/webhooks-security
    
    // For now, we'll skip signature validation for simplicity
    // In a production environment, you should validate the request

    // Parse the form data
    const formData = await req.formData();
    const fromNumber = formData.get('From') as string;
    const body = formData.get('Body') as string;
    
    // Skip processing if required fields are missing
    if (!fromNumber || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format the phone number to our standard format
    const formattedNumber = formatUKMobileNumber(fromNumber);

    // Process the SMS reply
    const result = await smsService.receiveReply({
      fromNumber: formattedNumber,
      messageContent: body
    });

    if (!result.success) {
      console.error('Error processing webhook:', result.error);
      return NextResponse.json(
        { error: 'Failed to process SMS reply' },
        { status: 500 }
      );
    }

    // Return a TwiML response
    // This is what Twilio expects as a response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <!-- We're not sending an automatic reply message -->
</Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml'
      }
    });
  } catch (error) {
    console.error('Unexpected error in Twilio webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 