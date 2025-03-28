# Event Planner 2.0

A comprehensive event planning application built with Next.js 14, React, Tailwind CSS, and Supabase.

## Features

- **Event Management**: Create, update, and manage events with detailed information
- **Customer Management**: Keep track of attendees and their details
- **Booking System**: Allow customers to book seats for events
- **SMS Notifications**: Send text message confirmations and reminders to customers
- **Dashboard**: View key metrics and upcoming events
- **Reports**: Generate reports on events, bookings, and customers

## SMS Notification System

The application includes a fully integrated SMS notification system that:

- Sends booking confirmations when a new booking is created
- Displays the SMS status for each booking (sent, failed, pending)
- Allows manual resending of SMS confirmations from the booking detail page
- Includes an opt-out toggle in the booking form for customers who don't want notifications
- Provides detailed analytics on SMS delivery status

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account for database and authentication
- Twilio account for SMS functionality (optional)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/event-planner.git
cd event-planner
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables by copying the example file
```bash
cp .env.example .env.local
```

4. Update the `.env.local` file with your Supabase and Twilio credentials
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
NEXT_PUBLIC_SMS_ENABLED=true
NEXT_PUBLIC_LOG_LEVEL=info
```

5. Start the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Current Status and Known Issues

Please refer to our [Implementation Plan V1.4](docs/IMPLEMENTATION_PLAN_V1.4.md) for details about current status and upcoming fixes. Key known issues include:

1. Customer deletion issues
2. Dashboard upcoming events not displaying
3. Category deletion issues
4. Navigation structure inconsistencies
5. SMS notification triggering problems

## Documentation

Comprehensive documentation is available in the `docs` directory:

- [Project Overview](docs/PROJECT_OVERVIEW.md) - High-level overview of the project
- [Handover Documentation](docs/HANDOVER.md) - Detailed technical documentation
- [Implementation Plan V1.4](docs/IMPLEMENTATION_PLAN_V1.4.md) - Current development plan
- [SMS Setup Guide](docs/SMS_SETUP.md) - Twilio integration instructions

## SMS Templates

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

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Supabase](https://supabase.io/) - Open source Firebase alternative
- [Twilio](https://www.twilio.com/) - Communication APIs

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXT_PUBLIC_SMS_ENABLED`: Enable/disable SMS functionality (true/false)
- `NEXT_PUBLIC_LOG_LEVEL`: Set logging level (debug, info, warn, error)

## Database Schema

The application uses the following tables in Supabase:

- `events`: Store event details
- `customers`: Store customer information
- `bookings`: Track event bookings
- `sms_messages`: Log SMS communication

## Architecture

The application follows a clean architecture pattern:

- `components/`: React components
- `services/`: Business logic and API calls
- `lib/`: Utility functions
- `types/`: TypeScript interfaces and types
- `app/`: Next.js pages and routes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 