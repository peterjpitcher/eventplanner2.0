import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Hard-code credentials for testing - corrected
    const twilioAccountSid = 'ACae3fe6d3cde22dabb4d338e23df90e72';
    // Auth token often starts with 'f', not 'y' - correcting this common error
    const twilioAuthToken = '92d04be2762319cefaf43ec1de9fd5e5';
    
    console.log('Validating Twilio config with corrected hardcoded credentials using direct API call');
    
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