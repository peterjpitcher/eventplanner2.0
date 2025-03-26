# Event Planner

A comprehensive web application for managing pub events, customer registrations, bookings, and automated SMS notifications.

## Features

- **Customer Management**: Register and manage customer details
- **Event Categories**: Organise events into categories
- **Event Management**: Create, edit and manage pub events
- **Booking Management**: Handle customer bookings for events
- **SMS Notifications**: Automated SMS reminders and confirmations
- **SMS Reply Handling**: Process customer responses to SMS messages
- **Dashboard & Reporting**: View insights and statistics

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, and Tailwind CSS
- **Backend**: Supabase (Authentication, PostgreSQL Database, Storage)
- **Communication**: Twilio SMS API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm or yarn
- Supabase account
- Twilio account (for SMS features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/peterjpitcher/eventplanner2.0.git
   cd eventplanner2.0
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Then fill in the required values in `.env.local`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
event-planner/
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts for state management
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and libraries
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper functions
├── public/                # Static assets
├── docs/                  # Project documentation
└── .github/               # GitHub configuration files
```

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Authentication Flow](docs/AUTHENTICATION.md)
- [Booking Management](docs/BOOKING_MANAGEMENT.md)
- [Changelog](docs/CHANGELOG.md)
- [Customer Management](docs/CUSTOMER_MANAGEMENT.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Database Setup](docs/DATABASE_SETUP.sql)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Development Notes](docs/DEVELOPMENT_NOTES.md)
- [Development Workflow](docs/DEVELOPMENT_WORKFLOW.md)
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
- [Mobile Functionality](docs/MOBILE_FUNCTIONALITY.md)
- [Mobile Optimization](docs/MOBILE_OPTIMIZATION.md)
- [Navigation Components](docs/NAVIGATION.md)
- [Project Decisions](docs/DECISIONS.md)
- [SMS Integration](docs/SMS_INTEGRATION.md)

Additional documentation is available in subdirectories:
- [API Documentation](docs/api/)
- [Architecture Details](docs/architecture/)
- [Setup Guides](docs/setup/)
- [Testing Documentation](docs/testing/)
- [User Guides](docs/user-guides/)
- [Workflow Guides](docs/workflows/)

## Project Status

- ✅ Phase 1: Project Setup
- ✅ Phase 2: Authentication
- ✅ Phase 3: Database Schema
- ✅ Phase 4: User Management
- ✅ Phase 5: Event Management
- ✅ Phase 6: Booking System
- ✅ Phase 7: SMS Integration - Setup
- ✅ Phase 8: Booking Confirmations
- ✅ Phase 9: SMS Reminders
- ⬜ Phase 10: Notification Preferences

## Contributing

Please read [CONTRIBUTING.md](.github/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# SMS Templates

The application includes a template management system for SMS messages. This allows you to customize the content of messages sent for different events, such as:

- Booking confirmations
- 7-day reminders
- 24-hour reminders
- Booking cancellations
- Event cancellations

Visit the SMS Templates page to edit these templates. You can use placeholders in your templates to automatically insert data:

| Placeholder | Description |
|-------------|-------------|
| `{customer_name}` | Customer's full name |
| `{customer_first_name}` | Customer's first name |
| `{event_name}` | Event title |
| `{event_date}` | Event date (e.g., "January 1") |
| `{event_time}` | Event time (e.g., "7 PM") |
| `{seats}` | Number of seats booked |

## Twilio Setup

To enable SMS functionality, the application uses Twilio. Configure your Twilio credentials in your environment variables:

```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
SMS_ENABLED=true
```

When deployed to Vercel, add these as environment variables in your project settings. 