# Setup Guide

This guide provides instructions for setting up the Event Management System for development and deployment.

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Git
- Supabase account
- Twilio account
- Vercel account (for deployment)

## Development Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/event-management-system.git
cd event-management-system
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Twilio credentials
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### 4. Set Up Supabase

1. Create a new project in Supabase
2. Create the database tables and policies as defined in [Database Schema](../specifications/PRD.md#5-database-schema-supabase)
3. Set up authentication in Supabase dashboard
4. Add the Supabase URL and anon key to your `.env.local` file

### 5. Set Up Twilio

1. Create a Twilio account
2. Obtain a phone number with SMS capabilities
3. Configure SMS webhook URL to point to your application's API endpoint
4. Add Twilio credentials to your `.env.local` file

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## Database Setup

The system uses the following database schema in Supabase:

- `customers` - Customer information
- `event_categories` - Event type definitions
- `events` - Individual scheduled events
- `bookings` - Customer event registrations

You can set up these tables manually in the Supabase dashboard or use the SQL script provided in the [Database Setup](./database-setup.sql) file.

## Testing

To run tests:

```bash
npm run test
# or
yarn test
```

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set the same environment variables in your Vercel project settings.

## Troubleshooting

### Common Issues

- **Supabase Connection Issues**: Verify your Supabase URL and anon key
- **Twilio SMS Not Sending**: Check Twilio credentials and ensure the phone number has SMS capabilities
- **Database Errors**: Verify schema matches requirements and RLS policies are configured correctly

For more detailed troubleshooting, refer to the [Troubleshooting Guide](./troubleshooting.md). 