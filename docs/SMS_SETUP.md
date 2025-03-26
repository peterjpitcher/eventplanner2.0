# SMS Setup and Usage Guide

## Overview

The Event Planner 2.0 application includes SMS notification capabilities that allow you to automatically send text messages to customers for booking confirmations, reminders, and other communications. This guide explains how to set up and use this functionality.

## Configuration

### Environment Variables

To enable SMS functionality, you need to set the following environment variables:

```
NEXT_PUBLIC_SMS_ENABLED=true
NEXT_PUBLIC_LOG_LEVEL=info
```

For production deployments using real SMS providers, you'll need additional credentials:

```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### Database Setup

Make sure your Supabase database has the `sms_messages` table with the following structure:

```sql
CREATE TABLE sms_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL,
  message TEXT NOT NULL,
  recipient TEXT NOT NULL,
  status TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

Also, create the SQL functions for SMS analytics:

```sql
CREATE OR REPLACE FUNCTION get_sms_counts_by_status()
RETURNS TABLE (status TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT sm.status, COUNT(sm.id)::BIGINT
  FROM sms_messages sm
  GROUP BY sm.status;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_sms_counts_by_type()
RETURNS TABLE (message_type TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT sm.message_type, COUNT(sm.id)::BIGINT
  FROM sms_messages sm
  GROUP BY sm.message_type;
END;
$$ LANGUAGE plpgsql;
```

## Using SMS Features

### Booking Confirmations

When creating a new booking through the booking form:

1. Fill in the booking details (customer, event, seats)
2. Check the "Send SMS confirmation" checkbox if you want the customer to receive an SMS
3. Submit the form
4. The system will automatically send an SMS if the customer has a valid mobile number

### Viewing SMS Status

On the booking details page:

1. Navigate to the "SMS Confirmation" section
2. View the current status (Sent, Failed, Not Sent, or Pending)
3. See when the SMS was sent (if applicable)
4. Use the "Resend SMS" button to send another confirmation if needed

### SMS Status Icons

The application uses the following status indicators:

- ✅ **Sent**: SMS was successfully delivered
- ❌ **Failed**: SMS delivery failed
- ⏱️ **Pending**: SMS is currently being processed
- ⚪ **Not Sent**: No SMS has been sent for this booking

## Troubleshooting

### SMS Not Being Sent

If SMS messages are not being sent:

1. Check that `NEXT_PUBLIC_SMS_ENABLED` is set to `true`
2. Verify that the customer has a valid mobile number
3. Ensure the Twilio credentials are correct (in production mode)
4. Check the application logs for any SMS-related errors

### Invalid Mobile Numbers

The system attempts to format mobile numbers according to E.164 standards. If customers' numbers are not in a compatible format:

1. Edit the customer's profile
2. Update their mobile number to include the country code (e.g., +44 for UK)
3. Try sending the SMS again

## Development and Testing

During development, the system simulates SMS sending without actually sending real text messages. This allows you to test the functionality without incurring SMS charges.

To view simulated SMS messages:

1. Check the console logs (they will include "[SIMULATED] Sending SMS to..." messages)
2. Look at the `sms_messages` table in your database to see the logged messages

## Integration with Real SMS Providers

This guide covers the default simulated SMS sending. To integrate with a real SMS provider (Twilio):

1. Sign up for a Twilio account and get your credentials
2. Update the environment variables with your Twilio details
3. Implement the Twilio API calls in the `sendSMS` function in `lib/sms-utils.ts`

## SMS Templates

Currently, SMS messages use a fixed template with placeholders for customer and event details. Future versions will include a template management system to customize the messages. 