# Changelog

## [Unreleased]

### Added
- Dashboard enhancement and navigation fixes
  - Fixed dashboard redirect issues for proper navigation flow
  - Created a standalone dashboard page at /dashboard path
  - Added consistent styling for dashboard components
  - Improved authentication flow and redirects
- Booking management system
  - Create, read, update, and delete bookings
  - Customer search and selection
  - Event selection and validation
  - Seats/reminder preferences
  - SMS notifications for bookings
  - Booking history and tracking
- Booking form component with validation
- Booking service for data management
- SMS notification service
- Toast notifications for user feedback
- Manual seat number input for bookings (planned)

### Changed
- Updated navigation links in sidebar and mobile navigation
- Enhanced loading states for authentication and data fetching
- Improved dashboard layout and components
- Updated project structure to include booking-specific components
- Enhanced form validation and error handling
- Improved user feedback with toast notifications
- Added optimistic updates for better UX
- Updated documentation to reflect booking system changes

### Fixed
- Dashboard redirect loop issue
- Issues with home page navigation for authenticated users
- Booking management features not working
- Event form styling issues
- Event category management
- Booking form dropdown functionality (planned)

### Security
- Added environment variable protection
- Enhanced error handling and recovery
- Improved form validation

### Documentation
- Updated architecture documentation
- Added booking system documentation
- Updated issues tracking
- Added changelog entries for booking system

## [0.1.0] - 2024-03-20

### Added
- Initial project setup
- Basic project structure
- Core dependencies
- Basic documentation

## [0.5.0] - 2024-03-26

### Added
- New implementation plan (IMPLEMENTATION_PLAN_V1.1.md) to address production issues
- AppLayout component for consistent layout across all pages

### Fixed
- Removed duplicate routes from (dashboard) route group
- Fixed route conflicts between dashboard routes
- Updated navigation to use correct routes

### Changed
- Updated HANDOVER.md with current status and detailed next steps
- Moved dashboard layout and page content to regular routes
- Improved documentation with latest deployment findings

### Issues Identified
- Dashboard missing visualizations and charts
- Customer, Category, and Event pages showing 404 errors
- Booking creation not working properly
- Delete functions not executing correctly in some cases 

## [0.6.0] - 2024-05-01

### Added
- New SMS test feature for verifying template functionality
- SMS configuration management utility
- Category deletion stored procedure
- Implementation summary document (IMPLEMENTATION_SUMMARY_V1.4.md)
- API endpoint for checking SMS status

### Fixed
- Customer deletion functionality now working properly
- Dashboard upcoming events display fixed
- Category deletion functionality implemented
- Removed Categories from navigation menu
- SMS notifications now working correctly for bookings
- Fixed SMS test message functionality
- Improved error handling throughout the application

### Changed
- Simplified dashboard queries for better performance
- Enhanced SMS configuration handling with database storage
- Updated documentation to reflect recent changes
- Improved logging for easier debugging

### Documentation
- Updated DECISIONS.md with v1.4 implementation decisions
- Updated IMPLEMENTATION_PLAN_V1.4.md with completion status 