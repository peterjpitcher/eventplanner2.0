import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use environment variables instead of hard-coded credentials
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || 'your_account_sid';
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token';
    
    console.log('Validating Twilio config using environment variables');
    
    // Use fetch instead of the Twilio SDK to avoid Next.js compatibility issues
    const apiUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}.json`;
    
    // Create authorization header with Basic auth
    const authHeaderValue = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authHeaderValue}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const accountData = await response.json();
      return NextResponse.json({
        success: true,
        message: `Connected to Twilio account: ${accountData.friendly_name || accountData.sid}`,
        accountDetails: {
          sid: accountData.sid,
          name: accountData.friendly_name,
          status: accountData.status
        }
      });
    } else {
      const errorData = await response.text();
      console.error('Twilio API error:', response.status, errorData);
      return NextResponse.json({
        success: false,
        error: `Twilio authentication failed: HTTP ${response.status} - ${errorData}`
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error validating Twilio config:', error);
    return NextResponse.json({
      success: false,
      error: `Unexpected error: ${error.message}`,
    }, { status: 500 });
  }
} 