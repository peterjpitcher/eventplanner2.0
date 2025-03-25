# Project Decisions

This document captures key decisions made during the development of the Event Management System, along with the reasoning behind them.

## Architecture & Technology Stack

### Frontend Framework
- **Decision**: Use Next.js with App Router and TypeScript
- **Reasoning**: Next.js provides server-side rendering capabilities, API routes, and excellent TypeScript integration. The App Router provides a modern, more intuitive routing system with improved layouts and loading states.
- **Alternatives Considered**: React with React Router, Remix, Astro
- **Date**: 2024-05-01

### Styling
- **Decision**: Use Tailwind CSS
- **Reasoning**: Tailwind CSS enables rapid UI development with utility classes and a consistent design system. It integrates well with Next.js and provides excellent responsiveness capabilities.
- **Alternatives Considered**: CSS Modules, Styled Components, Emotion
- **Date**: 2024-05-01

### Backend & Database
- **Decision**: Use Supabase for authentication, database, and storage
- **Reasoning**: Supabase provides a comprehensive backend solution with PostgreSQL database, authentication services, and storage capabilities. Its real-time features are beneficial for booking management.
- **Alternatives Considered**: Firebase, custom Node.js backend with PostgreSQL
- **Date**: 2024-05-01

### Communication Service
- **Decision**: Use Twilio for SMS messaging
- **Reasoning**: Twilio offers reliable SMS services with good documentation and a straightforward API. It supports two-way messaging needed for booking confirmations and cancellations.
- **Alternatives Considered**: MessageBird, Vonage (formerly Nexmo)
- **Date**: 2024-05-01

## Project Structure

### Code Organization
- **Decision**: Organize code by feature within the app directory
- **Reasoning**: Feature-based organization improves maintainability as the application grows. The App Router structure supports this approach with route groups and layouts.
- **Alternatives Considered**: Organization by technical role (components, hooks, etc.)
- **Date**: 2024-05-01

### Component Architecture
- **Decision**: Use a combination of server and client components based on requirements
- **Reasoning**: Server components reduce JavaScript sent to the client and improve initial page load. Client components are used where interactivity and client-side state are needed.
- **Alternatives Considered**: Primarily client-side components
- **Date**: 2024-05-01

## Feature Decisions

### Authentication
- **Decision**: Use Supabase authentication with email/password
- **Reasoning**: Supabase provides a secure, easy to implement authentication system that integrates directly with the database.
- **Alternatives Considered**: NextAuth.js, Firebase Authentication
- **Date**: 2024-05-03

### Authentication Context
- **Decision**: Implement a React context for auth state management
- **Reasoning**: A React context allows us to share authentication state across components without prop drilling, providing a clean way to manage user sessions.
- **Alternatives Considered**: Redux, Zustand, global state variables
- **Date**: 2024-05-03

### Route Protection
- **Decision**: Use a client-side route protection approach in layout components
- **Reasoning**: Client-side route protection allows for a better user experience with loading states and provides flexibility in handling authentication redirects.
- **Alternatives Considered**: Middleware-based protection, server-side route guards
- **Date**: 2024-05-03

### Navigation Structure
- **Decision**: Implement separate navigation components for desktop and mobile
- **Reasoning**: Different navigation patterns work better on different screen sizes - a sidebar for desktop provides more space and accessibility, while a bottom navigation bar is more thumb-friendly on mobile devices.
- **Alternatives Considered**: Responsive hamburger menu for all screen sizes, top navigation bar
- **Date**: 2024-05-03

### Mobile Experience
- **Decision**: Use responsive design with mobile-specific navigation components
- **Reasoning**: Responsive design ensures compatibility across devices. Mobile-specific navigation components provide better usability on small screens.
- **Alternatives Considered**: Separate mobile app, mobile-first approach
- **Date**: [Implementation Phase 15]

### SMS Integration
- **Decision**: Implement SMS via Twilio API with serverless functions
- **Reasoning**: Serverless functions provide a secure way to handle Twilio API keys and send messages. They can be scheduled or triggered by events.
- **Alternatives Considered**: Dedicated backend service, third-party integration services
- **Date**: [Implementation Phase 7]

## Development Workflow

### Version Control
- **Decision**: Use Git with GitHub and feature branch workflow
- **Reasoning**: Feature branches allow for isolated development and code review before merging to main.
- **Alternatives Considered**: Trunk-based development
- **Date**: 2024-05-01

### Deployment
- **Decision**: Use Vercel for hosting and CI/CD
- **Reasoning**: Vercel provides excellent integration with Next.js, automatic previews for pull requests, and simplified deployment workflows.
- **Alternatives Considered**: Netlify, AWS Amplify
- **Date**: 2024-05-01

## Phase 1 Implementation Decisions

### Next.js Setup
- **Decision**: Used create-next-app with TypeScript, ESLint, and Tailwind CSS
- **Reasoning**: This configuration provides a solid foundation with type safety, code quality tools, and efficient styling capabilities.
- **Date**: 2024-05-01

### Project Structure
- **Decision**: Created a modular directory structure with separate folders for components, lib, and app pages
- **Reasoning**: This organization improves code maintainability and makes it easier to locate and update code as the project grows.
- **Date**: 2024-05-01

### Environment Variables
- **Decision**: Created a comprehensive .env.local.example file with placeholders for all required API keys
- **Reasoning**: This provides clear documentation on what environment variables are needed and prevents accidental commitment of secret keys to the repository.
- **Date**: 2024-05-01

### Supabase Integration
- **Decision**: Set up a utility file for Supabase client initialization
- **Reasoning**: This centralizes Supabase connection logic and ensures consistent client usage throughout the application.
- **Date**: 2024-05-01

### Git Configuration
- **Decision**: Created a comprehensive .gitignore file and GitHub PR template
- **Reasoning**: The .gitignore prevents unnecessary files from being committed, while the PR template standardizes contribution information and review processes.
- **Date**: 2024-05-01

## Phase 2 Implementation Decisions

### Authentication Flow
- **Decision**: Used React context pattern for auth state management
- **Reasoning**: This provides a clean pattern for making authentication state available throughout the application without prop drilling.
- **Date**: 2024-05-03

### Form Components
- **Decision**: Created reusable UI components for forms (Button, Input)
- **Reasoning**: Reusable components ensure consistency across the UI and reduce duplication of styling and validation logic.
- **Date**: 2024-05-03

### Route Groups
- **Decision**: Used Next.js route groups with a dashboard layout
- **Reasoning**: Route groups allow us to share layouts across related routes while keeping the URL structure clean.
- **Date**: 2024-05-03

### Navigation Structure
- **Decision**: Created a sidebar for desktop and bottom navigation for mobile
- **Reasoning**: This approach optimizes the UI for each device type, providing familiar navigation patterns that work well for the respective screen sizes.
- **Date**: 2024-05-03

### Authentication Protection
- **Decision**: Used client-side route protection with redirection
- **Reasoning**: Client-side protection allows for a better user experience, including loading states, and provides flexibility in handling the authentication flow.
- **Date**: 2024-05-03

### Responsive Design
- **Decision**: Implemented responsive layouts with device-specific components using Tailwind CSS
- **Reasoning**: This ensures the application is usable across all device sizes while providing optimized experiences for each form factor.
- **Date**: 2024-05-03

## Phase 3 Implementation Decisions

### Customer Service Layer
- **Decision**: Created a dedicated service layer for customer operations
- **Reasoning**: This separates data access logic from UI components, making the code more maintainable and testable. It also centralizes all Supabase operations related to customers.
- **Date**: 2024-05-05

### Mobile Number Validation
- **Decision**: Implemented client-side validation for UK mobile numbers
- **Reasoning**: Early validation improves user experience by providing immediate feedback and reduces the chance of invalid data being sent to the server. This also aligns with the database-level validation already defined in Supabase.
- **Alternatives Considered**: Server-side validation only, third-party validation libraries
- **Date**: 2024-05-05

### Customer Form Reusability
- **Decision**: Created a single reusable form component for both creating and editing customers
- **Reasoning**: This reduces code duplication and ensures consistency in validation and user experience across create and edit operations.
- **Alternatives Considered**: Separate components for create and edit forms
- **Date**: 2024-05-05

### Customer Search Implementation
- **Decision**: Implemented search using Supabase's ilike operators for text matching
- **Reasoning**: This provides a flexible and efficient search capability without requiring additional libraries, leveraging Supabase's built-in functionality.
- **Alternatives Considered**: Client-side filtering, full-text search engines
- **Date**: 2024-05-05

### Error Handling
- **Decision**: Implemented comprehensive error handling with user-friendly messages
- **Reasoning**: Clear error messages improve the user experience by providing actionable information when something goes wrong.
- **Date**: 2024-05-05

### Optimistic UI Updates
- **Decision**: Implemented immediate UI updates followed by server confirmation for delete operations
- **Reasoning**: This provides a more responsive user experience by showing the result of actions immediately, while still ensuring data consistency.
- **Date**: 2024-05-05

## Phase 5: Event Management

### Data Model

1. **Event Entity Design**
   - Created a comprehensive event model with fields for title, description, category, date, time, price, capacity, and location.
   - Added flags for event status (published/draft and canceled).
   - Used nullable fields for optional information like end time and location.
   - Linked events to categories via foreign key relationship for template-based creation.

2. **Database Structure**
   - Implemented Row Level Security (RLS) policies to ensure users can only access their own events.
   - Added trigger for `updated_at` timestamp to track modifications.
   - Created indexes on frequently queried fields like date and category_id for performance.

### UI/UX Decisions

1. **Event Form Design**
   - Created a two-column form layout with logical grouping of related fields.
   - Implemented date picker for better date selection experience.
   - Added automatic field population from category defaults.
   - Included validation for required fields.

2. **Event Listing**
   - Designed a table-based list with color-coded category indicators.
   - Added status badges for quick identification of published/draft/canceled events.
   - Implemented sorting by date and time for chronological display.

3. **Event Details**
   - Created a detailed event view with visual status indicators.
   - Separated metadata (date, time, price) from descriptive content.
   - Added edit and delete actions with appropriate confirmation dialogs.

### Technical Decisions

1. **Service Layer**
   - Implemented comprehensive event service with methods for all CRUD operations.
   - Added specialized methods for upcoming events and category-filtered queries.
   - Used join queries to fetch category information alongside events.

2. **Component Structure**
   - Created reusable components for event forms to maintain consistency.
   - Separated form logic from display logic using container components.
   - Implemented cancellation as a soft-delete to preserve event history.

3. **Dashboard Integration**
   - Added upcoming events section to dashboard for quick access.
   - Displayed key event statistics for better overview.
   - Implemented quick-action buttons for common event operations.

### Future Considerations

1. **Event Recurrence**
   - Future implementation will support recurring events with pattern definition.
   - Will require additional database structure for recurrence rules.

2. **Calendar View**
   - Planning to add a calendar visualization for better temporal understanding.
   - Will implement color coding by category.

3. **Advanced Filtering**
   - Will add more sophisticated filtering and search capabilities as event volume grows.
   - Plan to implement saved searches for frequently used filters.

## Phase 6: Booking Management

### Data Model
1. **Booking Entity Design**
   - Created a comprehensive booking model with fields for customer_id, event_id, seats_or_reminder, and notes
   - Implemented many-to-one relationships with both events and customers
   - Used a flexible "seats_or_reminder" field to accommodate different booking types (seat reservations vs. notifications)

### UI Components
1. **Booking List Component**
   - Implemented a dedicated component for displaying bookings associated with an event
   - Added functionality to delete bookings with confirmation
   - Included customer details from joined data for easy reference

2. **Quick Book Component**
   - Created a streamlined booking creation interface accessible from event details
   - Implemented expandable UI that only shows the form when needed
   - Added success handling to refresh the bookings list upon successful creation

3. **Booking Form Component**
   - Built a reusable form component for both creating and editing bookings
   - Implemented customer search functionality to filter available customers
   - Added seats/reminder preference options including 1-5+ seats and reminder-only options

### Service Layer
1. **Booking Service Implementation**
   - Created a service layer for booking operations with Supabase
   - Implemented methods to fetch bookings by event or customer
   - Included full join data (customer and event information) in query responses
   - Added proper error handling and response formatting

### Integration with Existing Components
1. **Event Details Enhancement**
   - Updated event details page to include booking management
   - Used client/server component pattern with wrapper components
   - Implemented page refreshing to keep booking list updated

2. **Routing Structure**
   - Added dedicated routes for editing bookings
   - Maintained consistent navigation patterns with back buttons

### Mobile Considerations
1. **Responsive Design**
   - Ensured all booking interfaces work well on mobile devices
   - Used flexible layouts that adapt to screen size

### Technical Decisions
1. **Client/Server Component Split**
   - Used wrapper components to bridge between server components (event details) and client components (booking lists/forms)
   - Maintained clear separation of concerns between data fetching and UI interaction

## Phase 7: SMS Integration

### SMS Service Architecture
1. **Service Layer Approach**
   - Created a centralized SMS service to manage all SMS operations
   - Separated concerns between SMS utility functions and business logic
   - Implemented a clean interface for sending different types of messages

### Phone Number Handling
1. **UK Number Standardization**
   - Implemented comprehensive phone number formatting for UK mobile numbers
   - Added support for multiple input formats (+44, 07XXX, etc.)
   - Created conversion utilities to E.164 format required by Twilio

### Twilio Integration
1. **Webhook Handling**
   - Set up a dedicated endpoint for Twilio webhooks
   - Implemented proper response format for Twilio (TwiML)
   - Added error handling for malformed requests

2. **Development Mode**
   - Created a simulation mode for development without sending real messages
   - Added detailed logging for simulated messages
   - Implemented a test endpoint for manual testing

### Error Handling
1. **Graceful Degradation**
   - Designed the system to continue booking operations even if SMS fails
   - Added comprehensive error logging for SMS failures
   - Implemented retry logic where appropriate

### SMS Templates
1. **Template System**
   - Created a flexible template system with variable replacement
   - Defined standard templates for different message types
   - Ensured consistent branding and messaging across all communications

### Database Design
1. **Message Tracking**
   - Implemented tables for tracking sent messages and their status
   - Added storage for SMS replies with customer association
   - Created indexes for efficient querying of message history

### Security Considerations
1. **Environment Variables**
   - Used secure environment variables for storing sensitive Twilio credentials
   - Added configuration options to enable/disable SMS functionality
   - Created documentation for secure setup

## Phase 9: SMS Reminders

### Reminder System Design

1. **Reminder Types**
   - **Decision**: Implemented two distinct reminder types (7-day and 24-hour)
   - **Reasoning**: This provides balanced communication - an early reminder for planning and a just-in-time reminder to reduce no-shows
   - **Alternatives Considered**: Single reminder, configurable reminder times per event
   - **Date**: 2024-05-15

2. **Processing Logic**
   - **Decision**: Skip reminders for timepoints that have already passed when a booking is created
   - **Reasoning**: Avoids sending irrelevant reminders (e.g., a 7-day reminder when booking is made 3 days before the event)
   - **Alternatives Considered**: Adjusting reminder timing for late bookings, sending all reminders regardless of timing
   - **Date**: 2024-05-15

3. **Technical Implementation**
   - **Decision**: Used date-fns for date calculations and formatting
   - **Reasoning**: date-fns provides accurate date manipulation with timezone handling, which is critical for scheduling reminders
   - **Alternatives Considered**: moment.js, native JavaScript Date objects
   - **Date**: 2024-05-15

### Process Automation

1. **Service Architecture**
   - **Decision**: Created a dedicated reminder service separate from the SMS service
   - **Reasoning**: Maintains separation of concerns - SMS service handles message delivery while reminder service handles scheduling and processing logic
   - **Alternatives Considered**: Integrated with booking service, single SMS service with reminder functions
   - **Date**: 2024-05-15

2. **Error Handling**
   - **Decision**: Implemented robust error handling with status tracking for each reminder attempt
   - **Reasoning**: Provides visibility into the reminder process and enables retries for failed attempts
   - **Alternatives Considered**: Simple success/failure tracking without detailed errors
   - **Date**: 2024-05-15

3. **Customer Data Validation**
   - **Decision**: Added multiple validation layers for customer data in reminder processing
   - **Reasoning**: Prevents failures due to missing or invalid customer information, improving system reliability
   - **Alternatives Considered**: Relying on database constraints, simpler validation patterns
   - **Date**: 2024-05-15

### User Experience

1. **Manual Triggers**
   - **Decision**: Added ability to manually trigger reminders from booking details page
   - **Reasoning**: Gives staff control to send additional reminders when needed or retry failed ones
   - **Alternatives Considered**: Fully automated system without manual intervention
   - **Date**: 2024-05-15

2. **Status Visibility**
   - **Decision**: Added visual indicators for reminder status in the booking details view
   - **Reasoning**: Provides transparency about which reminders have been sent, are pending, or have failed
   - **Alternatives Considered**: SMS log without explicit reminder status tracking
   - **Date**: 2024-05-15

## Booking Cancellation Implementation

**Date**: 2024-05-09

**Context**:
As part of Phase 10, we needed to implement booking cancellation with optional SMS notifications. The system should allow users to cancel bookings and optionally send SMS notifications to customers informing them of the cancellation.

**Options**:
1. Simple confirmation with mandatory SMS - Always send SMS on booking cancellation
2. Simple confirmation without SMS - Never send SMS on cancellation
3. Confirmation dialog with SMS checkbox - Let the user decide whether to send an SMS

**Decision**:
We chose option 3 - Implementing a confirmation dialog with an SMS option toggle, giving the user control over whether to send a cancellation notification.

**Reasons**:
1. Maximum flexibility - Allows staff to decide on a case-by-case basis
2. Accommodates different scenarios - Some cancellations may be initiated by customers themselves
3. Reduces notification spam - Avoids unnecessary messages when not needed
4. Transparent user experience - Makes it clear what actions will be taken

**Implementation Details**:
1. Added a `booking_cancellation.txt` template for SMS messages 
2. Enhanced `deleteBooking` method in the booking service to accept a `sendSMS` parameter
3. Implemented a modal confirmation dialog with an SMS toggle
4. Added loading states during cancellation process
5. Improved feedback with toast notifications for success/failure
6. Implemented proper error handling

**Status**: Completed

## Phase 10: Booking Cancellations with SMS Notifications

### Booking Cancellation Workflow
- **Decision**: Implemented a cancellation workflow with SMS notifications
- **Reasoning**: Providing SMS notifications for booking cancellations improves customer service and reduces confusion.
- **Alternatives Considered**: Email-only notifications, no automated notifications
- **Date**: 2024-05-25

### SMS Template for Booking Cancellations
- **Decision**: Created a specific SMS template for booking cancellations
- **Reasoning**: Having a dedicated template ensures clear and consistent messaging for cancellations.
- **Date**: 2024-05-25

### Cancellation Status Tracking
- **Decision**: Updated booking status to track cancellations separately from other states
- **Reasoning**: This allows for better reporting and analytics on cancellation reasons and patterns.
- **Date**: 2024-05-25

## Phase 11: Event Cancellations with SMS Notifications

### Event Cancellation Workflow
- **Decision**: Enhanced the event cancellation process with SMS notification capabilities
- **Reasoning**: When events are canceled, it's crucial to notify all affected customers promptly to reduce confusion and provide good customer service.
- **Alternatives Considered**: Email-only notifications, manual notification process
- **Date**: 2024-05-26

### SMS Template for Event Cancellations
- **Decision**: Created a specific SMS template for event cancellations
- **Reasoning**: A dedicated template ensures appropriate messaging for event-wide cancellations versus individual booking cancellations.
- **Date**: 2024-05-26

### Bulk SMS Notification System
- **Decision**: Implemented a system to send SMS notifications to all bookings for a canceled event
- **Reasoning**: This ensures efficient notification of all affected customers with a single action, reducing manual work.
- **Date**: 2024-05-26

### Custom Message Support
- **Decision**: Added support for optional custom messages in event cancellation notifications
- **Reasoning**: This provides flexibility to add context-specific information about the cancellation or potential rescheduling.
- **Date**: 2024-05-26

### User Interface Enhancements
- **Decision**: Added a Cancel Event button on the event details page and a confirmation dialog with SMS options
- **Reasoning**: This provides a clear workflow for event cancellation and ensures staff consider whether to send notifications.
- **Date**: 2024-05-26

## Phase 12: SMS Reply Handling

### SMS Replies Interface
- **Decision**: Created a dedicated Messages page to view and manage customer SMS replies
- **Reasoning**: This gives staff a centralized place to view and respond to all incoming customer messages, improving customer service.
- **Alternatives Considered**: Embedding replies directly in booking or event interfaces
- **Date**: 2024-05-27

### Unread Message Indicators
- **Decision**: Added unread message badges in the navigation menu
- **Reasoning**: This ensures staff are aware of new messages without needing to actively check, leading to faster responses to customer inquiries.
- **Date**: 2024-05-27

### Message Status Management
- **Decision**: Implemented read/unread state management with easy toggling
- **Reasoning**: This helps staff track which messages they've already seen and prioritize new messages.
- **Date**: 2024-05-27

### Customer Context Integration
- **Decision**: Added a messages section to customer profiles
- **Reasoning**: Viewing messages in the context of a specific customer provides additional context for staff responses.
- **Date**: 2024-05-27

### Automatic Polling
- **Decision**: Implemented automatic polling for new messages
- **Reasoning**: This ensures timely notification of new messages without requiring page refreshes.
- **Date**: 2024-05-27
