# Decision Log

This document records significant decisions made during the development of the Event Management System.

## Table of Contents

- [Technology Stack Decisions](#technology-stack-decisions)
- [Architectural Decisions](#architectural-decisions)
- [Database Design Decisions](#database-design-decisions)
- [UI/UX Design Decisions](#uiux-design-decisions)
- [Feature Implementation Decisions](#feature-implementation-decisions)
- [Testing Strategy Decisions](#testing-strategy-decisions)

## Technology Stack Decisions

### Decision: Using Supabase for Backend & Authentication

**Date**: [Current Date]

**Context**:
The application requires a database, API layer, and authentication system. We needed to choose a backend solution that would be efficient to implement, maintain, and scale.

**Decision**:
We chose Supabase as our backend platform for the following reasons:
- Built-in authentication system with JWT support
- PostgreSQL database with powerful querying capabilities
- Real-time subscription features
- Row-level security for data protection
- Simplified API access without needing to build a custom backend

**Consequences**:
- Faster development time due to pre-built features
- Less server-side code to maintain
- Potential limitations in complex custom logic
- Dependency on a third-party service

### Decision: Simplified Authentication

**Date**: [Current Date]

**Context**:
We needed to determine the approach for user authentication, including roles and permissions.

**Decision**:
Based on client feedback, we implemented a simple authentication system with:
- No complex user roles or permissions
- Single account shared between the owner and partner
- Email/password authentication without social login options

**Consequences**:
- Simplified authentication flow
- No need for complex permission management
- Reduced development time
- Limited ability to track which user performed which action

### Decision: Using React with Tailwind CSS

**Date**: [Current Date]

**Context**:
We needed a frontend framework that would allow for efficient component development and a CSS framework that supports responsive, mobile-first design.

**Decision**:
We chose React with Tailwind CSS because:
- React's component-based architecture aligns with our modular approach
- Tailwind's utility-first approach enables rapid UI development
- Both technologies have strong community support and documentation
- Tailwind's mobile-first approach supports our mobile optimization requirements

**Consequences**:
- Efficient development of reusable UI components
- Consistent styling across the application
- Lower learning curve for developers familiar with React
- Potential for larger initial CSS bundle (addressed through purging)

### Decision: Using Twilio for SMS Services

**Date**: [Current Date]

**Context**:
The application requires reliable SMS notification capabilities with support for receiving and processing replies.

**Decision**:
We chose Twilio because:
- Well-established SMS API with high reliability
- Support for two-way messaging (sending and receiving)
- Comprehensive documentation and SDKs
- Reasonable pricing model

**Consequences**:
- Need to manage Twilio credentials securely
- Additional API integration complexity
- Dependency on external service for critical notification features
- Cost implications based on SMS volume

## Architectural Decisions

### Decision: Serverless Architecture with Vercel

**Date**: [Current Date]

**Context**:
We needed to determine the deployment and hosting strategy for the application.

**Decision**:
We chose a serverless architecture deployed on Vercel because:
- Seamless integration with Next.js
- Built-in CI/CD pipeline
- Automatic scaling without infrastructure management
- Edge network for improved performance

**Consequences**:
- Simplified deployment process
- No server management overhead
- Function execution time limits
- Cold start considerations for infrequently used functions

### Decision: Mobile-First Design Approach

**Date**: [Current Date]

**Context**:
The application needs to work effectively on both mobile and desktop devices, with a focus on mobile usability.

**Decision**:
We adopted a mobile-first design approach with:
- Bottom navigation menu for mobile
- Responsive layouts that adapt to larger screens
- Touch-friendly UI elements
- Optimized forms for mobile input

**Consequences**:
- Improved user experience on mobile devices
- Additional design considerations for adapting to desktop
- Potential challenge in fitting complex features on smaller screens
- Need for thorough cross-device testing

### Decision: Feature Availability on Mobile vs Desktop

**Date**: [Current Date]

**Context**:
Some features may be more suitable for desktop use than mobile, and we needed to determine which features should be available on which platforms.

**Decision**:
Based on client requirements, we decided to:
- Make most core functionality available on both mobile and desktop
- Restrict administrative and complex features to desktop only, including:
  - Customer data import
  - System settings and administration
  - Dashboard statistics and reporting
  - Event deletion
  - Event category management
  - Bulk operations

**Consequences**:
- Optimal user experience on each platform
- Clear separation between mobile-friendly and desktop-only features
- Need for conditional rendering based on device type
- Consistent core functionality across devices

## Database Design Decisions

### Decision: Additional Tables for SMS Tracking

**Date**: [Current Date]

**Context**:
The PRD specified SMS notification features but did not detail how to track and manage sent messages and replies.

**Decision**:
We added two additional tables to the schema:
- `sms_messages`: To track outgoing SMS messages
- `sms_replies`: To store and manage incoming customer replies

**Consequences**:
- Improved tracking and auditing of all SMS communications
- Ability to reference message history in the UI
- Additional database relationships to maintain
- Slightly increased data storage requirements

### Decision: Mobile Number Standardization

**Date**: [Current Date]

**Context**:
UK mobile numbers can be entered in various formats (e.g., 07XXX XXX XXX, +44 7XXX XXX XXX), but need to be stored consistently and converted for Twilio.

**Decision**:
We implemented database triggers to:
- Standardize mobile numbers to a consistent UK format for storage
- Create functions to convert between UK and international formats as needed

**Consequences**:
- Consistent data storage regardless of input format
- Simplified querying and searching of mobile numbers
- Automated format conversion for Twilio integration
- Additional database processing during customer creation/updates

### Decision: Data Retention Approach

**Date**: [Current Date]

**Context**:
We needed to determine how to handle historical data for events, bookings, and customer interactions.

**Decision**:
Based on client requirements, we decided to:
- Keep all data indefinitely within Supabase's storage limits
- Not implement automatic archiving or deletion of old events
- Maintain complete history of all bookings and customer interactions

**Consequences**:
- Complete historical record available for reference
- Potential for database growth over time
- May need pagination and optimized queries for performance
- Potential future need for archiving strategy as data grows

## UI/UX Design Decisions

### Decision: List-Only Event View

**Date**: [Current Date]

**Context**:
We needed to determine the most effective way to display events to users.

**Decision**:
Based on client feedback, we decided to:
- Implement a chronological list view of events
- Remove the calendar view option entirely
- Focus on simple, straightforward event navigation

**Consequences**:
- Simplified UI with consistent event display
- Reduced complexity in implementation
- More screen space for event details
- Easier maintenance with only one view to support

### Decision: Collapsible Event-Booking View

**Date**: [Current Date]

**Context**:
The application needs to display events with their associated bookings in an intuitive way without overwhelming the user.

**Decision**:
We implemented a collapsible view where:
- Events are displayed in a list
- Each event can be expanded to show its bookings
- Booking details are nested under their parent event

**Consequences**:
- Cleaner, less cluttered UI
- Hierarchical relationship between events and bookings is clear
- Users need to interact (expand) to see booking details
- May require additional user education for first-time users

### Decision: Confirmation Dialogs for Critical Actions

**Date**: [Current Date]

**Context**:
Actions like sending SMS notifications or cancelling bookings/events have customer-facing impacts and potential costs.

**Decision**:
We implemented confirmation dialogs with Yes/No options for:
- Booking cancellations before sending SMS
- Event cancellations before sending mass SMS
- Other critical actions with external impacts

**Consequences**:
- Reduced risk of accidental actions
- Enhanced user control over notifications
- Additional step in the workflow
- Clearer understanding of action consequences

## Feature Implementation Decisions

### Decision: No Real-Time Capacity Validation

**Date**: [Current Date]

**Context**:
The PRD specified that real-time capacity validation is not required when making bookings.

**Decision**:
We implemented booking creation without enforcing capacity limits, but with visual indicators:
- Show current booking count vs. capacity
- Allow overbooking
- Provide visual warning when an event is at or over capacity

**Consequences**:
- Simplified booking workflow
- Flexibility for administrators to manage exceptions
- Potential for confusion if events are significantly overbooked
- Need for clear UI indicators of capacity status

### Decision: Fixed Reminder Schedule

**Date**: [Current Date]

**Context**:
We needed to determine when and how reminder notifications should be sent to customers.

**Decision**:
Based on client requirements, we implemented:
- Two fixed reminder points: 7 days and 24 hours before events
- 7-day reminder uses the day name (e.g., "Monday", "Tuesday")
- 24-hour reminder uses "tomorrow"
- Logic to skip reminders if the time point has already passed when booking is created

**Consequences**:
- Consistent customer experience across all events
- More user-friendly reminder format with day names
- Simplified implementation without configurable schedules
- Clear expectations for when reminders are sent

### Decision: Predefined SMS Templates

**Date**: [Current Date]

**Context**:
The system requires SMS templates for various notification types.

**Decision**:
Based on client requirements, we implemented:
- Fixed, predefined templates stored as constants
- No UI-based template editing
- Standard variables across templates (customer name, event details, etc.)
- Consistent "The Anchor" signature across all templates

**Consequences**:
- Consistent messaging across all notifications
- No risk of template corruption through editing
- Limited flexibility for custom messaging
- Need for code changes to modify templates

### Decision: Feature Removal

**Date**: [Current Date]

**Context**:
Some initially proposed features were determined to be unnecessary for the core functionality of the application.

**Decision**:
Based on client feedback, we removed the following features:
- Calendar view for events
- Test SMS functionality
- Capacity reports
- Advanced search
- Mass messaging capability

**Consequences**:
- Simplified user interface
- Reduced development time
- More focused feature set
- Lower maintenance complexity

## Testing Strategy Decisions

### Decision: Comprehensive Testing Approach

**Date**: [Current Date]

**Context**:
We needed to determine the appropriate testing strategy for ensuring application quality.

**Decision**:
We adopted a multi-layered testing approach:
- Unit tests for components and utility functions
- Integration tests for feature workflows
- End-to-end tests for critical user journeys
- Manual testing for UI/UX verification

**Consequences**:
- Higher confidence in application reliability
- Earlier detection of issues
- Additional development time for test creation
- Need for CI integration to run tests automatically 