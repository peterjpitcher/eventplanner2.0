import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, messageContent } = body;
    
    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }
    
    if (!messageContent) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      );
    }
    
    // Use environment variables instead of hard-coded credentials
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || 'your_account_sid';
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token';
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';
    
    console.log(`Sending test SMS to ${phoneNumber} with environment variables using direct API call`);
    
    // Use fetch instead of the Twilio SDK to avoid Next.js compatibility issues
    const apiUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    // Create authorization header with Basic auth
    const authHeaderValue = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
    
    // Create form data for Twilio API
    const formData = new URLSearchParams();
    formData.append('From', twilioPhoneNumber);
    formData.append('To', phoneNumber);
    formData.append('Body', messageContent);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeaderValue}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });
    
    if (response.ok) {
      const messageData = await response.json();
      console.log('Message sent:', messageData.sid);
      
      return NextResponse.json({
        success: true,
        message: {
          sid: messageData.sid,
          status: messageData.status,
          direction: messageData.direction,
          from: messageData.from,
          to: messageData.to
        }
      });
    } else {
      const errorData = await response.text();
      console.error('Twilio API error:', response.status, errorData);
      return NextResponse.json(
        { 
          success: false,
          error: `Failed to send SMS: HTTP ${response.status} - ${errorData}`
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error in SMS test API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unexpected error processing request',
        message: error.message
      },
      { status: 500 }
    );
  }
} 