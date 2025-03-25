# Enhanced Product Requirements Document (PRD)

## Event Management System for Pub Events

### 1. Overview

An intuitive web application to efficiently manage pub events, customer registrations, bookings, and automated SMS notifications with simple navigation and mobile optimisation.

### 2. Technical Stack

- Backend & Authentication: Supabase (including Auth)
- SMS Service: Twilio (including SMS replies setup)
- Deployment & Hosting: Vercel
- Version Control: GitHub
- Frontend Framework: React with Tailwind CSS

### 3. Core Functional Requirements

#### 3.1 Customer Management

**Customer Registration & Profile:**
- Mandatory: First Name, Mobile Number (validated UK format: 07XXX XXX XXX)
- Optional: Last Name, Notes

**Customer Directory:**
- Searchable by name or mobile number
- Quick-view access to detailed customer profiles, booking histories, and SMS history

**Mobile Number Management:**
- Store numbers in standardised UK local format
- Automatic conversion to international format (+44XXXXXXXXX) for Twilio
- Robust validation ensuring accuracy and UK-specific compliance

**Customer Import:**
- Ability to import customer data in bulk (desktop only)

#### 3.2 Event Management

**Event Category Configuration:**
- Define categories with default capacity, start times, and custom notes

**Event Creation & Scheduling:**
- Auto-fill event details based on category defaults with manual adjustments
- Custom capacity limits and scheduling

**Event Overview & Tracking:**
- List view with bookings nested under each event in a collapsible view (includes customer name, booking date, seats/reminder status, notes)
- Quick book action to pair customers with events easily

#### 3.3 Booking Management

**Booking Workflow:**
- Simple pairing of customers to events with optional notes
- Option to create bookings just for reminders
- No real-time capacity validation

**SMS Notifications:**
- Automatic SMS sent upon booking creation or reminder
- SMS sent for booking or event cancellations

#### 3.4 SMS Notifications

**Automated SMS Alerts:**
- Booking confirmation
- Booking cancellation (with confirmation dialog)
- Event cancellation (with confirmation dialog and mass messaging)
- Reminder notifications (7 days before using day name, and 24 hours before)

**SMS Reply Management:**
- Integration with Twilio for managing incoming SMS replies
- Customer replies trigger alerts in the customer directory and log entries

**SMS Templates:**
- Predefined templates for various notification types
- Standard variables for customer name, event details, etc.
- Consistent branding with "The Anchor" signature

### 4. User Interface (UI) Requirements

#### 4.1 Design Principles

- User-friendly, clean, and minimalist UI
- Mobile-optimised interface
- Simple, intuitive workflows without complicated navigation or wizards
- Bottom sticky menu (mobile) with quick links: Events, Customers, Message Alerts
- Use of icons for action buttons
- Reusable components for quick and centralised customisation

#### 4.2 Key Screens

**Dashboard:**
- Simple overview of upcoming events and recent activity (desktop only)

**Customers:**
- Directory with intuitive search functionality
- Add/Edit customer interface
- Customer detail views with nested future bookings and notes

**Events:**
- List view of events in chronological order
- Add/Edit event forms
- Quick-booking functionality

**Message Alerts:**
- View and manage incoming SMS replies

#### 4.3 Mobile vs Desktop Functionality

- All core features available on desktop
- Selected features available on mobile as specified in the functionality decision list
- Customer data import restricted to desktop
- System administration features desktop-only
- Reporting and dashboard features desktop-only
- Event deletion and category management desktop-only

### 5. Database Schema (Supabase)

**Tables & Relationships**

**customers**
- id (UUID, PK)
- first_name (TEXT)
- last_name (TEXT, optional)
- mobile_number (TEXT, validated)
- notes (TEXT)
- created_at (TIMESTAMP)

**event_categories**
- id (UUID, PK)
- name (TEXT)
- default_capacity (INTEGER)
- default_start_time (TIME)
- notes (TEXT)
- created_at (TIMESTAMP)

**events**
- id (UUID, PK)
- name (TEXT)
- category_id (UUID, FK to event_categories)
- capacity (INTEGER)
- start_time (TIMESTAMP)
- notes (TEXT)
- created_at (TIMESTAMP)

**bookings**
- id (UUID, PK)
- customer_id (UUID, FK to customers)
- event_id (UUID, FK to events)
- seats_or_reminder (TEXT)
- notes (TEXT)
- created_at (TIMESTAMP)

**sms_messages**
- id (UUID, PK)
- customer_id (UUID, FK to customers)
- booking_id (UUID, FK to bookings, nullable)
- message_type (TEXT)
- message_content (TEXT)
- sent_at (TIMESTAMP)
- status (TEXT)

**sms_replies**
- id (UUID, PK)
- customer_id (UUID, FK to customers)
- from_number (TEXT)
- message_content (TEXT)
- received_at (TIMESTAMP)
- read (BOOLEAN)

### 6. Security & Compliance Requirements

- Strict user authentication (Supabase Auth)
- Secure encryption and storage of Twilio credentials
- Input sanitisation and validation
- Protection against vulnerabilities (SQL injection, XSS)

### 7. Performance Standards

- UI responsiveness: page load under 2 seconds
- Booking actions responsive (< 1 second)
- Database query optimisation

### 8. Documentation

- Comprehensive, structured documentation created concurrently with development
- Clearly organised directory for documentation storage
- Step-by-step setup and usage instructions
- Database schema and API documentation
- Component-level documentation 