# SMS Integration Setup Guide

## Overview

The Event Planner application now includes SMS notification capabilities for:

1. Booking confirmations - sent when a new booking is created
2. Cancellation notifications - sent when a booking is deleted or an event is cancelled
3. Automated reminders - sent 7 days and 24 hours before events

This document provides instructions for setting up and configuring the SMS functionality.

## Prerequisites

- Access to the application's environment variables
- Twilio account (for production use) with:
  - Account SID
  - Auth Token
  - Twilio phone number

## Environment Configuration

Add the following environment variables to your `.env` file:

```
# SMS Configuration
SMS_PROVIDER=mockSms  # Options: mockSms, twilio
SMS_ENABLED=true      # Set to false to disable SMS completely
SMS_DEFAULT_COUNTRY_CODE=44  # Default country code (without +)
MOCK_SMS_DELAY=2000   # Delay in ms for mock SMS (for testing)

# Twilio Configuration (only needed if SMS_PROVIDER=twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=your_twilio_phone_number

# API Authentication for Automated Reminders
API_AUTH_TOKEN=your_secure_token  # Used to authenticate the reminder API
SKIP_API_AUTH=false  # Set to true in development for testing
```

## Providers

The system supports multiple SMS providers:

### Mock Provider (Development)

- Simulates SMS sending for testing purposes
- Logs messages to the console
- Configurable delay to simulate network latency
- Always available in development environments

### Twilio Provider (Production)

- Uses Twilio's SMS API to send real messages
- Requires valid Twilio credentials
- Supports international numbers with proper formatting
- Recommended for production environments

## Message Types

The system supports the following types of SMS messages:

1. **Booking Confirmations**
   - Sent automatically when a new booking is created
   - Can be toggled by the user during booking creation
   - Includes event details, date, time, and seats reserved

2. **Cancellation Notifications**
   - **Booking Cancellations**: Sent when a booking is deleted (optional)
   - **Event Cancellations**: Sent to all customers with bookings when an event is cancelled (optional)
   - Includes information about the cancelled booking/event

3. **Automated Reminders**
   - **7-day Reminders**: Sent 7 days before the event date
   - **24-hour Reminders**: Sent 24 hours before the event date
   - Processed automatically via scheduled job
   - Can also be sent manually for individual bookings

## Automated Reminder Setup

The system includes an automated reminder feature that sends SMS notifications to customers before their booked events:

### Reminder Types

1. **7-day Reminder**
   - Sent 7 days before the event
   - Provides an early reminder to help customers plan

2. **24-hour Reminder**
   - Sent 24 hours before the event (the day before)
   - Serves as a final reminder

### Setting Up the Scheduled Job

Reminders are processed automatically using a GitHub Actions workflow:

1. **Workflow Configuration**
   - Located at `.github/workflows/process-reminders.yml`
   - Runs daily at 8:00 AM UTC
   - Can also be triggered manually via GitHub Actions UI

2. **Repository Secrets**
   - Add the following secrets to your GitHub repository:
     - `API_AUTH_TOKEN`: The same token specified in your environment
     - `API_BASE_URL`: The base URL of your deployed application

3. **API Authentication**
   - The workflow uses token authentication to call the reminder processing API
   - Ensure the `API_AUTH_TOKEN` matches between your application and GitHub secrets

### Manual Reminder Testing

To test the reminder system without waiting for the scheduled job:

1. Trigger the workflow manually via GitHub Actions
2. Or call the API endpoint directly:
   ```bash
   curl -X POST https://your-app-url/api/reminders/process \
     -H "Authorization: Bearer your_api_auth_token" \
     -H "Content-Type: application/json"
   ```

### Sending Manual Reminders

Staff can also send manual reminders for individual bookings:

1. Go to the booking details page
2. Find the "Reminders" section
3. Click "Send Reminder"
4. Select the reminder type (7-day or 24-hour)
5. Confirm sending the reminder

## Troubleshooting

### SMS Not Being Sent

1. Check that `SMS_ENABLED` is set to `true`
2. Verify the customer has a valid mobile number
3. Ensure your SMS provider configuration is correct
4. Check application logs for detailed error messages

### Invalid Mobile Numbers

The system attempts to format mobile numbers by:

1. Adding the default country code if missing
2. Removing spaces and special characters
3. Ensuring the number starts with a "+" symbol

If numbers are still not formatted correctly, ensure they are entered in a standard format.

## SMS Status Icons

The application uses the following status indicators:

- ✅ **Sent**: The message was successfully delivered
- ❌ **Failed**: The message failed to send
- ⏳ **Pending**: The message is being processed
- ⚪ **Not Sent**: No message has been sent yet

These indicators appear throughout the UI to show the status of various SMS notifications. 