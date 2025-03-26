# Implementation Plan V1.5: SMS Functionality Enhancement

## Overview

This implementation plan outlines the steps to enhance the Event Planner application with comprehensive SMS functionality. Building on our initial SMS implementation, we'll develop a complete solution that includes booking confirmations, cancellation notifications, and automated reminders.

## Goals

1. ✅ Provide immediate SMS confirmations for new bookings
2. ✅ Send cancellation notifications when bookings or events are cancelled
3. Implement automated 7-day and 24-hour reminder system
4. Create a daily CRON job to process reminders automatically
5. ✅ Ensure all SMS activities are properly tracked and monitored

## Prerequisites

- ✅ Twilio account with SMS capabilities (currently simulated)
- GitHub account for Actions (CRON job)
- ✅ Access to the application's database

## Environment Setup

The following environment variables must be configured:

```
# SMS Settings
NEXT_PUBLIC_SMS_ENABLED=true
NEXT_PUBLIC_LOG_LEVEL=info
# For production with Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Phase 1: SMS Template System

**Objective**: Create a flexible template system for all SMS messages

### Tasks

1. **Template Schema Design**
   - Create `sms_templates` table with fields:
     - `id` (uuid)
     - `name` (text): Identifier for the template
     - `content` (text): Template content with placeholders
     - `description` (text): Usage description
     - `created_at` (timestamp)
     - `updated_at` (timestamp)

2. **Initial Templates Creation**
   - Booking confirmation template:
     ```
     Hi {{customer_name}}, your booking for {{event_name}} on {{date}} at {{time}} is confirmed. Reply to this message if you need to make changes.
     ```
   - Booking cancellation template:
     ```
     Hi {{customer_name}}, your booking for {{event_name}} on {{date}} at {{time}} has been cancelled. Contact us if you have any questions.
     ```
   - Event cancellation template:
     ```
     Hi {{customer_name}}, we regret to inform you that {{event_name}} scheduled for {{date}} at {{time}} has been cancelled. We apologize for any inconvenience.
     ```
   - 7-day reminder template:
     ```
     Hi {{customer_name}}, this is a reminder about your booking for {{event_name}} on {{date}} at {{time}}. We look forward to seeing you!
     ```
   - 24-hour reminder template:
     ```
     Hi {{customer_name}}, just a reminder that you're booked for {{event_name}} tomorrow at {{time}}. We look forward to seeing you!
     ```

3. **Template Management UI**
   - Create admin interface for managing templates
   - Allow editing of template content
   - Add template testing functionality

### Files to Modify/Create

- `src/lib/templates.ts` - Template processing utilities
- `src/pages/admin/sms-templates.tsx` - Template management UI
- `src/components/sms/TemplateEditor.tsx` - Template editing component
- `src/components/sms/TemplatePreview.tsx` - Template preview component
- Database migration for `sms_templates` table

## Phase 2: Booking Confirmation SMS

**Objective**: Send immediate SMS confirmations when bookings are created

### Tasks

1. ✅ **Booking Service Enhancement**
   - ✅ Update booking creation flow to send SMS after successful booking
   - ✅ Add toggle in UI for customers to opt-in/out of SMS
   - ✅ Implement error handling for SMS failures

2. ✅ **Confirmation Logic**
   - ✅ Create a message with booking data
   - ✅ Send message via SMS service
   - ✅ Record sending status in database

3. ✅ **User Interface Updates**
   - ✅ Add SMS toggle to booking form
   - ✅ Display SMS status in booking confirmation
   - ✅ Show appropriate feedback for success/failure

### Files Modified/Created

- ✅ `src/services/booking-service.ts` - Updated to include SMS
- ✅ `src/services/sms-service.ts` - Created new service
- ✅ `src/components/bookings/booking-form.tsx` - Added SMS toggle
- ✅ `src/components/bookings/booking-detail.tsx` - Included SMS status
- ✅ `src/components/bookings/sms-status.tsx` - Created new component
- ✅ `src/lib/logger.ts` - Added logging utility

## Phase 3: Cancellation Notifications

**Objective**: Implement SMS notifications for booking and event cancellations

### Tasks

1. ✅ **Booking Cancellation Flow**
   - ✅ Add confirmation dialog with SMS option
   - ✅ Implement cancellation message sending
   - ✅ Handle error cases gracefully

2. ✅ **Event Cancellation Mass Notifications**
   - ✅ Create batch processing for multiple recipients
   - ✅ Add confirmation with recipient count
   - ✅ Implement rate-limiting for large batches
   - ✅ Show progress indicators for large batches

3. ✅ **Cancellation Status Tracking**
   - ✅ Record all SMS messages in database
   - ✅ Create failover mechanism for failed messages
   - ✅ Update UI to show sending status

### Files Modified/Created

- ✅ `src/services/booking-service.ts` - Added cancellation notifications
- ✅ `src/components/bookings/booking-detail.tsx` - Updated deletion dialog
- ✅ `src/services/event-service.ts` - Added mass cancellation capability
- ✅ `src/components/events/event-cancellation-dialog.tsx` - Created dialog component

## Phase 4: Automated Reminder System

**Objective**: Implement 7-day and 24-hour reminder system with daily CRON job

### Tasks

1. ✅ **Reminder Processing Logic**
   - ✅ Create algorithm to identify bookings requiring reminders
   - ✅ Implement 7-day reminder identification
   - ✅ Implement 24-hour reminder identification
   - ✅ Add duplicate prevention mechanism

2. ✅ **API Endpoint for CRON Job**
   - ✅ Create API route that processes reminders
   - ✅ Add security token authentication
   - ✅ Implement logging for all operations
   - ✅ Return detailed status report

3. ✅ **GitHub Actions Workflow**
   - ✅ Create workflow file for daily execution at 8am UTC
   - ✅ Configure proper authentication
   - ✅ Set up error notifications
   - ✅ Add timeout and retry logic

### Files to Modify/Create

- ✅ `src/app/api/reminders/process/route.ts` - API endpoint
- ✅ `src/services/reminder-service.ts` - Reminder processing
- ✅ `.github/workflows/process-reminders.yml` - GitHub Action
- ✅ `src/lib/api-auth.ts` - API authentication utility

## Phase 5: Manual Reminder Controls

**Objective**: Allow staff to manually send reminders through the UI

### Tasks

1. ✅ **Booking Detail Enhancement**
   - ✅ Add "Send Reminder" button to booking detail page
   - ✅ Show SMS status for the booking
   - ✅ Show reminder history for the booking

2. ✅ **Reminder Status Tracking**
   - ✅ Update database schema to track reminder status
   - ✅ Create UI to display reminder statuses
   - ✅ Prevent sending duplicate reminders (with warning)

3. **Bulk Operations**
   - Create interface for sending reminders to multiple bookings
   - Add filtering by event, date range
   - Implement batch processing with status updates

### Files Modified/Created

- ✅ `src/components/bookings/booking-detail.tsx` - Updated booking detail page
- ✅ `src/components/bookings/sms-status.tsx` - Created component
- ✅ `src/components/ui/tooltip.tsx` - Created component

## Phase 6: Monitoring Dashboard

**Objective**: Create a dashboard for monitoring SMS activity

### Tasks

1. **SMS Activity Dashboard**
   - Create overview of recent SMS activity
   - Display success/failure rates
   - Show upcoming reminders to be processed

2. **Detailed Message Logs**
   - Implement filterable message log view
   - Add ability to resend failed messages
   - Create export functionality for logs

3. **System Status Indicators**
   - Show SMS service connection status
   - Display templates status
   - Monitor CRON job execution

### Files to Modify/Create

- `src/pages/admin/sms-dashboard.tsx` - New page
- `src/components/sms/activity-chart.tsx` - Activity visualization
- `src/components/sms/message-logs.tsx` - Logs view
- `src/components/sms/system-status.tsx` - Status indicators

## Phase 7: Testing and Documentation

**Objective**: Ensure system reliability and comprehensive documentation

### Tasks

1. **End-to-End Testing**
   - Manual verification of all SMS flows
   - Create automated tests for critical paths
   - Test error handling and edge cases

2. ✅ **Documentation Updates**
   - ✅ Create SMS integration documentation
   - ✅ Create setup guide
   - ✅ Document implementation details
   - Add CRON job maintenance instructions

3. **Code Cleanup**
   - Remove temporary testing code
   - Standardize error handling
   - Optimize database queries

### Files Modified/Created

- ✅ `docs/IMPLEMENTATION_NOTES.md` - Created implementation documentation
- ✅ `docs/SMS_SETUP.md` - Created setup guide
- Various source files for cleanup

## Technical Implementation Details

### SMS Templates System

We'll use a template system with placeholders in double curly braces, e.g., `{{customer_name}}`. The template processor will:

1. Load the template from the database
2. Replace all placeholders with actual values
3. Perform validation (length, content)
4. Send the processed message

### CRON Job Implementation

The GitHub Actions workflow will:

1. Run daily at 9am UTC
2. Call our API endpoint with a secure token
3. The endpoint will:
   - Find bookings occurring exactly 7 days from now (7-day reminders)
   - Find bookings occurring tomorrow (24-hour reminders)
   - Process each group with appropriate templates
   - Return success/failure counts

### Database Updates

We'll need to add:
- `last_reminder_sent` timestamp to bookings table
- `reminder_7day_sent` boolean to bookings table
- `reminder_24hr_sent` boolean to bookings table
- `sms_templates` table for template management

## Wrap-up

This implementation plan provides a structured approach to enhancing the Event Planner application with comprehensive SMS capabilities. By following these phases, we'll deliver a robust system that handles booking confirmations, cancellations, and automated reminders effectively.

The end result will be a system that:
- Improves customer communication through timely notifications
- Reduces no-shows with automated reminders
- Provides staff with tools to manage customer communication
- Offers insight into messaging performance and activity 