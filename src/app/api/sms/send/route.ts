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
    
    console.log(`Simple SMS test: To ${phoneNumber}, Message: ${messageContent.substring(0, 30)}...`);
    
    // Build API request to Twilio
    const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    // Create form data for Twilio API
    const formData = new URLSearchParams();
    formData.append('From', twilioPhoneNumber);
    formData.append('To', phoneNumber);
    formData.append('Body', messageContent);
    
    // Create authorization header with Basic auth
    const authString = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
    
    try {
      // Make the API request to Twilio
      const twilioResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      
      console.log('Twilio API response status:', twilioResponse.status);
      
      if (twilioResponse.ok) {
        const data = await twilioResponse.json();
        console.log('Message sent with SID:', data.sid);
        
        return NextResponse.json({
          success: true,
          message: {
            sid: data.sid,
            status: data.status,
            from: data.from,
            to: data.to
          }
        });
      } else {
        const errorText = await twilioResponse.text();
        console.error('Twilio API error:', twilioResponse.status, errorText);
        
        return NextResponse.json(
          { 
            success: false, 
            error: `Twilio API error (${twilioResponse.status}): ${errorText}`
          },
          { status: 400 }
        );
      }
    } catch (twilioError: any) {
      console.error('Error sending message via Twilio:', twilioError);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Error sending message: ${twilioError.message || 'Unknown error'}`
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error in send SMS API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: `Server error: ${error.message || 'Unknown error'}`
      },
      { status: 500 }
    );
  }
} 