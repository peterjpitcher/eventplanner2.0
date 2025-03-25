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

- [Product Requirements](docs/PRD.md)
- [Development Workflow](docs/WORKFLOW.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Setup Guide](docs/SETUP.md)
- [Database Setup](docs/DATABASE_SETUP.sql)
- [API Documentation](docs/API.md)
- [Testing Strategies](docs/TESTING.md)
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
- [Project Decisions](docs/DECISIONS.md)

## Implementation Progress

The implementation is being carried out in phases:

- ✅ Phase 1: Project Setup
- ⏳ Phase 2: Authentication & Navigation
- ⏳ Phase 3: Customer Management - Basic
- ⏳ Phase 4-17: Subsequent phases

See the [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) for more details.

## Contributing

Please read [CONTRIBUTING.md](.github/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 