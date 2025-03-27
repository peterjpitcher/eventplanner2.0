# Clarifying Questions and Answers

The following questions sought clarification on aspects of the Event Management System requirements that would benefit from additional detail:

## 1. Authentication Requirements

**Question**: The PRD mentions Supabase Auth but doesn't specify what type of authentication system is required for pub staff. Should we implement email/password authentication, social login options, or both? Is there a need for different user roles (admin, staff, etc.)?

**Answer**: No staff access control is needed. The system will only be used by the owner and their partner.

## 2. SMS Template Management

**Question**: The PRD mentions customisable SMS templates. Should users be able to edit these templates directly through the UI, or should these be predefined templates with variable placeholders? What level of customisation is required?

**Answer**: Templates will be provided in the specifications folder in a directory called 'SMS Templates' and should be used from there.

## 3. Mobile Number Validation Details

**Question**: For UK mobile number validation, are there specific validation rules beyond the format (07XXX XXX XXX)? Should the system reject numbers that don't match this pattern, or attempt to reformat them automatically?

**Answer**: Just ensure the numbers are in the specified format (07XXX XXX XXX).

## 4. Booking Cancellation Workflow

**Question**: When a booking is cancelled, should the system automatically send an SMS notification, or should this be a manual option? Is there any additional workflow or data that needs to be captured when cancelling a booking?

**Answer**: The system should display a confirmation window with yes/no options before sending cancellation SMS notifications.

## 5. Event Category Details

**Question**: The PRD mentions event categories with default settings. Are there specific categories that should be pre-created in the system, or is this entirely user-defined? Should the system support deletion or deactivation of categories?

**Answer**: Categories will be created by the user as part of testing. No pre-defined categories needed.

## 6. Reminder Notification Timing

**Question**: For reminder notifications, when should these be sent relative to the event time? Is this a fixed time (e.g., 24 hours before) or should it be configurable per event or category?

**Answer**: Two reminder notifications should be sent:
- 7 days before the event
- 24 hours before the event
If either of these time points has already passed when booking is created, no need to send that reminder.

## 7. Multi-device Synchronisation

**Question**: If multiple staff members are using the system simultaneously on different devices, are there any specific real-time synchronisation requirements beyond what Supabase provides by default?

**Answer**: No additional synchronisation requirements beyond Supabase's default capabilities.

## 8. Data Retention Policy

**Question**: Are there any requirements for data retention, archiving, or deletion of old events, bookings, or customer data? Should the system automatically archive past events?

**Answer**: Data should be kept as long as Supabase will allow. No specific retention policy needed.

## 9. Exporting and Reporting

**Question**: Does the system need to support exporting data (e.g., customer lists, event bookings) or generating reports? If so, what formats and specific reports are required?

**Answer**: No export functionality needed, but customer data import functionality should be available on desktop only.

## 10. Offline Functionality

**Question**: Does the system need to support any offline functionality for situations where internet connectivity is limited or unavailable? If so, what features are critical to work offline?

**Answer**: No offline functionality required. 