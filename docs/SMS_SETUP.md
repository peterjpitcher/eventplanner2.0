# Twilio SMS Integration Setup

This document provides a step-by-step guide to configure Twilio SMS integration for the Event Planner 2.0 application.

## Prerequisites

- A Twilio account (you can sign up for a free trial at [Twilio.com](https://www.twilio.com))
- A Twilio phone number with SMS capabilities
- Event Planner 2.0 application deployed or running locally

## Obtaining Twilio Credentials

1. **Create a Twilio Account**
   - Sign up at [Twilio.com](https://www.twilio.com) if you don't have an account
   - Verify your email and personal phone number

2. **Purchase a Twilio Phone Number**
   - Go to the Phone Numbers section in your Twilio Dashboard
   - Click "Buy a Number"
   - Ensure the number has SMS capabilities
   - Complete the purchase

3. **Locate Your Credentials**
   - On your Twilio Dashboard, find the "Account Info" section
   - You'll need three pieces of information:
     - Account SID
     - Auth Token
     - Your Twilio Phone Number

## Configuration

### Local Development

1. Copy the `.env.example` file to `.env.local`:
   ```
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Twilio credentials:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number  # Include + and country code (e.g., +12025551234)
   SMS_ENABLED=true
   SMS_DEFAULT_COUNTRY_CODE=44  # Default country code for UK numbers
   ```

3. Restart your development server to apply the changes.

### Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to the "Environment Variables" section
3. Add the following environment variables:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
   - `SMS_ENABLED` (set to "true")
   - `SMS_DEFAULT_COUNTRY_CODE` (set to "44" for UK)
4. Click "Save" to apply the changes
5. Redeploy your application to ensure the changes take effect

## Testing SMS Functionality

Once you've configured the Twilio integration, you can test the SMS functionality:

1. Create a new event
2. Create a new booking with "Send SMS notification" checked
3. You should receive a confirmation message on your phone

If SMS messages are not being sent:
- Check the console logs for any errors
- Verify that your Twilio credentials are correct
- Ensure your Twilio account has sufficient balance
- Check that the recipient's phone number is in the correct format (+44XXXXXXXXXX for UK)

## Troubleshooting

### SMS Not Sending

- **Invalid Credentials**: Verify your Twilio Account SID and Auth Token
- **Phone Number Format**: Ensure phone numbers are in E.164 format (e.g., +447123456789)
- **Twilio Account Status**: Confirm your Twilio account is active and not in trial mode limitations
- **Environment Variables**: Make sure environment variables are correctly set up
- **Server Logs**: Check the logs for any specific error messages from Twilio

### SMS Delivered But Not Received

- **Phone Carrier Blocking**: Some carriers may block messages from unrecognized sources
- **Opt-Out Status**: Recipients might have opted out from receiving messages from your Twilio number
- **Content Filtering**: Message content might be getting flagged as spam

## Support

If you encounter any issues with the Twilio integration, please:

1. Review the [Twilio Documentation](https://www.twilio.com/docs/sms)
2. Check the [Twilio Console Debugger](https://www.twilio.com/console/sms/logs) for detailed error messages
3. Contact your system administrator or development team with specific error details 