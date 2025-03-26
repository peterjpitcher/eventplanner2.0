# Event Planner 2.0 Implementation Plan v1.1

## Issues Summary

Based on testing in production, the following critical issues have been identified:

1. **Dashboard**: Missing graphs and charts; only shows navigation buttons
2. **Customers**: 404 error when creating, viewing, or editing; Delete function prompts but doesn't execute
3. **Categories**: 404 error on all operations
4. **Events**: 404 error on all operations
5. **Bookings**: Page loads, but creating a booking reloads the page; 404 errors for viewing and editing bookings
6. **Route Structure**: Route conflicts between regular routes and (dashboard) route group

## Root Causes Analysis

1. **Routing Issues**: The application has duplicate routes from the migration of /(dashboard) route group to regular routes
2. **API Integration**: Service functions may be failing to connect to the backend properly
3. **Form Handling**: Form submissions may be improperly configured, causing navigation issues
4. **AppLayout Component**: The AppLayout component might not be properly wrapping all necessary pages
5. **Missing API Implementations**: Some API endpoints may be missing or improperly implemented
6. **Dashboard Component**: Missing chart components for the dashboard

## Environment Setup

Before beginning implementation, ensure you have:

1. **Local Development Environment**:
   - Node.js 18.17.0 or later
   - npm or yarn package manager
   - Git for version control
   - Code editor (VS Code recommended with ESLint and Prettier extensions)

2. **Access Requirements**:
   - GitHub repository access (github.com/peterjpitcher/eventplanner2.0)
   - Supabase account credentials
   - Vercel account access
   - Twilio account credentials (for SMS features)

3. **Environment Variables Setup**:
   ```
   # Create local .env.local file with:
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   # For SMS features:
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=your-twilio-phone-number
   ```

4. **Install Dependencies**:
   ```bash
   npm install
   ```

5. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Implementation Plan

### Phase 1: Fix Routing Structure (Priority: Highest) ✅ COMPLETED

**Objective**: Resolve all routing conflicts and 404 errors by establishing a clean routing structure

#### Technical Details:

1. **Remove Duplicate Routes**: ✅ COMPLETED
   - Examine `src/app/(dashboard)` directory and identify all page files
   - Check corresponding regular routes in `src/app/*` directories
   - Delete files in `src/app/(dashboard)/*` after confirming regular routes exist
   - Specific files to check:
     - `src/app/(dashboard)/bookings/page.tsx` vs `src/app/bookings/page.tsx`
     - `src/app/(dashboard)/customers/page.tsx` vs `src/app/customers/page.tsx`
     - `src/app/(dashboard)/categories/page.tsx` vs `src/app/categories/page.tsx`
     - `src/app/(dashboard)/events/page.tsx` vs `src/app/events/page.tsx`

2. **Fix Page Structure**: ✅ COMPLETED
   - Update each regular route page component to use the `AppLayout` component consistently:
     - `src/app/dashboard/page.tsx` ✅
     - `src/app/customers/page.tsx` ✅
     - `src/app/customers/[id]/page.tsx` ✅
     - `src/app/customers/new/page.tsx` ✅
     - `src/app/customers/[id]/edit/page.tsx` ✅
     - `src/app/events/page.tsx` ✅
     - `src/app/events/[id]/page.tsx` ✅
     - `src/app/events/new/page.tsx` ✅
     - `src/app/categories/page.tsx` ✅
     - `src/app/categories/[id]/page.tsx` ✅
     - `src/app/categories/new/page.tsx` ✅
     - `src/app/bookings/page.tsx` ✅
     - `src/app/bookings/[id]/page.tsx` ✅
     - `src/app/bookings/new/page.tsx` ✅
   
   - Update imports for consistency: ✅ COMPLETED
   ```tsx
   'use client';
   
   import { AppLayout } from '@/components/layout/app-layout';
   // Other imports

   export default function PageName() {
     return (
       <AppLayout>
         {/* Page content */}
       </AppLayout>
     );
   }
   ```

3. **Navigation Updates**: ✅ COMPLETED
   - Update navigation links in `src/components/navigation/sidebar.tsx`
   - Update mobile navigation in `src/components/navigation/mobile-nav.tsx`
   - Fix any hardcoded route links throughout the application

4. **Documentation Updates**: ✅ COMPLETED
   - Update `docs/NAVIGATION.md` with new routing structure
   - Add notes to `docs/DEVELOPMENT_NOTES.md` about the routing changes

#### Testing Criteria:
- All pages should load without 404 errors ✅
- Navigation between pages should work correctly ✅
- AppLayout should appear consistently on all pages ✅
- Mobile and desktop navigation should link to the correct routes ✅

**Completion Date**: [Current Date]
**Notes**: Successfully added AppLayout to all pages and verified correct routing structure. Converted server components to client components for consistency.

**Estimated Time**: 1 day
**Dependencies**: None
**Key Files**: 
- `src/app/(dashboard)/*` - Files to be removed
- `src/app/*/*.tsx` - Pages to update with AppLayout
- `src/components/navigation/*` - Navigation components to update
- `src/components/layout/app-layout.tsx` - Layout component to use

### Phase 2: Fix Customer Management (Priority: High) ✅ COMPLETED

**Objective**: Restore full functionality to customer management features

#### Technical Details:

1. **Customer Service Unification**: ✅ COMPLETED
   - Identified conflict between two customer service implementations:
     - `src/utils/customer-service.ts` (old implementation)
     - `src/services/customer-service.ts` (new implementation)
   - Consolidated all functionality into a single service at `src/services/customer-service.ts`
   - Enhanced the service with proper error handling and consistent API responses
   - Added mobile number formatting and validation utilities directly to the service
   - Exported helper functions for wider use in the application
   - Removed the redundant utility file to prevent future conflicts

2. **Customer Component Updates**: ✅ COMPLETED
   - Updated all customer-related components to use the unified service:
     - `src/components/customers/customer-list.tsx` - Updated to use `customerService.deleteCustomer`
     - `src/components/customers/customer-form.tsx` - Updated to use `customerService.isValidUKMobileNumber`
     - `src/components/customers/customer-detail.tsx` - Updated to use `customerService.formatUKMobileNumber`
   - Implemented proper error handling and loading states in all components
   - Added user-friendly error messages for failed operations
   - Enhanced mobile number display with consistent formatting

3. **Customer Page Updates**: ✅ COMPLETED
   - Updated all customer-related pages to use the unified service:
     - `src/app/customers/page.tsx` - Customer list page now uses `customerService.getCustomers` and `searchCustomers`
     - `src/app/customers/new/page.tsx` - Now uses `customerService.createCustomer`
     - `src/app/customers/[id]/page.tsx` - Now uses `customerService.getCustomerById`
     - `src/app/customers/[id]/edit/page.tsx` - Now uses `customerService.updateCustomer`
   - Standardized error handling approach across all pages
   - Added improved loading states and user feedback
   - Fixed redirection after form submissions

4. **Error Handling Improvements**: ✅ COMPLETED
   - Standardized error handling format using the `ApiResponse` type
   - Added specific error messages for common failure scenarios
   - Improved error logging for debugging purposes
   - Added visual error feedback for users with dismiss options
   - Ensured all operations have proper loading indicators

5. **Mobile Number Formatting**: ✅ COMPLETED
   - Implemented standardized UK mobile number formatting
   - Added validation for different mobile number formats:
     - Standard: 07XXX XXXXXX
     - International with +: +447XXX XXXXXX
     - International without +: 447XXX XXXXXX
   - Ensured consistent formatting when creating and updating customers
   - Added proper validation in forms with helpful error messages

#### Testing Criteria:
- Customer list loads successfully with data ✅
- Customer creation form submits and redirects correctly ✅
- Customer editing form loads, submits, and redirects correctly ✅
- Customer deletion works with confirmation ✅
- Proper error messages appear when operations fail ✅
- Mobile numbers are properly formatted in all views ✅
- Form validation prevents submission of invalid mobile numbers ✅

**Completion Date**: [Current Date]
**Notes**: Successfully unified the customer service implementation, ensuring consistent behavior across all customer management features. Enhanced error handling and user feedback for a better user experience.

**Estimated Time**: 1 day
**Dependencies**: Phase 1
**Key Files**:
- `src/services/customer-service.ts` - Unified service for customer operations
- `src/lib/phone-utils.ts` - Utilities for phone number formatting
- `src/components/customers/customer-list.tsx` - Updated list component
- `src/components/customers/customer-form.tsx` - Updated form component
- `src/components/customers/customer-detail.tsx` - Updated detail component
- `src/app/customers/*.tsx` - Updated customer pages
- `docs/DOCUMENTATION.md` - Updated documentation

### Phase 3: Fix Events and Categories (Priority: High) ✅ COMPLETED

**Objective**: Restore functionality to event and category management features

#### Technical Details:

1. **Service Implementations Enhancement**: ✅ COMPLETED
   - Updated `event-category-service.ts` to use the ApiResponse type and improve error handling
   - Consolidated error handling in all service methods:
     - getCategories
     - getCategoryById
     - createCategory
     - updateCategory
     - deleteCategory
   - Enhanced `event-service.ts` with consistent ApiResponse type and improved error handling
   - Fixed SMS-related functionality in the event cancellation process

2. **Category Page Updates**: ✅ COMPLETED
   - Updated category list page (`src/app/categories/page.tsx`) to ensure proper loading and error states
   - Fixed the "New Category" page to be a client component with AppLayout
   - Updated the category edit page to load data clientside with proper loading states
   - Ensured consistent UI experience across all category management pages

3. **Page Structure Fixes**: ✅ COMPLETED
   - Converted server components to client components where needed
   - Added missing AppLayout to all category pages
   - Updated navigation flows to ensure redirection works properly
   - Improved error handling and user feedback throughout the category management flow

4. **Error Handling Improvements**: ✅ COMPLETED
   - Added try/catch blocks in all service methods
   - Standardized error response format using ApiResponse type
   - Improved error messages and logging
   - Added error display UI for better user experience

#### Testing Criteria:
- Category list loads successfully with data ✅
- Category creation form submits and redirects correctly ✅
- Category editing form loads, submits, and redirects correctly ✅
- Category deletion works with confirmation ✅
- Event features work properly with the updated services ✅

**Completion Date**: [Current Date]
**Notes**: Successfully enhanced the event and category services with improved error handling. Converted necessary components to client components with proper loading states and error handling.

**Estimated Time**: 1 day
**Dependencies**: Phase 1 & 2
**Key Files**:
- `src/services/event-category-service.ts` - Updated service with proper error handling
- `src/services/event-service.ts` - Updated with ApiResponse type and error handling
- `src/app/categories/*.tsx` - Updated category pages with proper client-side data fetching
- `src/app/categories/[id]/edit/page.tsx` - Converted to client component
- `src/app/categories/new/page.tsx` - Converted to client component

### Phase 4: Fix Booking Management (Priority: High) ✅ COMPLETED

**Objective**: Restore full functionality to booking management

#### Technical Details:

1. **Booking Service Enhancements**: ✅ COMPLETED
   - Updated `src/services/booking-service.ts` to support SMS notifications
   - Enhanced the BookingFormData interface to include send_notification field
   - Added proper type handling for seats_or_reminder (string | number)
   - Updated createBooking and updateBooking to respect send_notification setting
   - Improved error handling throughout all service methods
   - Added support for notification status in response (smsSent flag)

2. **Booking Form Components**: ✅ COMPLETED
   - Fixed the QuickBook component in `src/components/bookings/quick-book.tsx`:
     - Added preventDefault() to prevent page reload on form submission
     - Added validation for customer selection, event ID, and seat numbers
     - Implemented proper loading states and error handling
     - Added toast notifications for success and failure scenarios
   
   - Updated the BookingForm component in `src/components/bookings/booking-form.tsx`:
     - Added SMS notification toggle checkbox
     - Improved number validation for seats
     - Enhanced error handling and user feedback
     - Fixed form submission to convert string values to appropriate types
     - Added proper disabled states during form submission

3. **Booking List Components**: ✅ COMPLETED
   - Enhanced `src/components/bookings/booking-list.tsx` with:
     - Improved error handling with retry functionality
     - Loading indicators for both initial load and delete operations
     - Better empty state handling with guidance for users
     - Loading states during CRUD operations
     - Callback support to notify parent components of changes

4. **Booking Detail and Edit Components**: ✅ COMPLETED
   - Updated `src/components/bookings/booking-detail.tsx` to:
     - Use the proper service methods instead of direct fetch calls
     - Add loading indicators for all operations
     - Enhance SMS sending UI with proper loading states
     - Improve error handling and messaging
   
   - Fixed the BookingEdit component in `src/components/bookings/booking-edit.tsx`:
     - Added validation before submission
     - Enhanced error handling and user feedback
     - Improved loading states for better UX
     - Fixed handling of notification preferences

5. **SMS Implementation**: ✅ COMPLETED
   - Added the sendReminder function to the smsService
   - Enhanced booking notifications to include status updates
   - Fixed API integration issues with the SMS service
   - Added proper error handling for SMS delivery failures

#### Testing Criteria:
- Booking list loads successfully with data ✅
- QuickBook form creates bookings without page reload ✅
- Bookings can be created with SMS notifications ✅
- Booking detail view shows all information correctly ✅
- Editing a booking works and shows changes ✅
- Deleting a booking works with confirmation ✅
- SMS notifications can be sent from the booking detail page ✅

**Completion Date**: [Current Date]
**Notes**: Successfully enhanced the booking management system with improved error handling, SMS notification support, and better user experience. Fixed the page reload issue during booking creation and ensured consistent behavior across all booking-related functionality.

**Estimated Time**: 2 days
**Dependencies**: Phases 1 and 3
**Key Files**:
- `src/services/booking-service.ts` - Updated to include SMS notification support
- `src/services/sms-service.ts` - Added sendReminder function
- `src/components/bookings/quick-book.tsx` - Fixed form submission and added validation
- `src/components/bookings/booking-list.tsx` - Improved error handling and loading states
- `src/components/bookings/booking-form.tsx` - Added notification toggle and enhanced validation
- `src/components/bookings/booking-detail.tsx` - Updated to use proper service methods
- `src/components/bookings/booking-edit.tsx` - Fixed validation and error handling
- `src/app/bookings/page.tsx` - Enhanced with better error handling and loading states

### Phase 5: Implement Dashboard Visualizations (Priority: Medium) ✅ COMPLETED

**Objective**: Add the missing graphs and charts to the dashboard

#### Technical Details:

1. **Dashboard Data Service**: ✅ COMPLETED
   - Created a comprehensive dashboard service in `src/services/dashboard-service.ts`:
     - Implemented data fetching for key metrics (customers, events, bookings)
     - Added calculation of booking statistics by month
     - Created customer growth tracking over time
     - Added error handling and type safety with TypeScript interfaces
     - Implemented responsive loading states for all components

2. **Chart Implementation**: ✅ COMPLETED
   - Added chart.js and react-chartjs-2 libraries for data visualization
   - Created reusable chart components:
     - BookingStatsChart: Displays booking counts by month
     - CustomerGrowthChart: Shows customer growth over time
     - Added loading states and fallbacks for empty data
   - Implemented proper TypeScript interfaces for all chart data

3. **Dashboard Components**: ✅ COMPLETED
   - Created a statistics card component for key metrics
   - Implemented an upcoming events widget
   - Added refresh functionality to update dashboard data
   - Ensured consistent styling across all components
   - Improved UI for empty states and loading indicators

4. **Dashboard Page Enhancements**: ✅ COMPLETED
   - Updated the dashboard layout with new components
   - Added statistics cards for key metrics
   - Implemented grid layout for charts and widgets
   - Maintained quick navigation links for common actions
   - Added proper error handling and loading states

5. **Performance Considerations**: ✅ COMPLETED
   - Optimized data fetching to minimize database queries
   - Implemented client-side data transformation for visualization
   - Used responsive charts that adapt to screen size
   - Added proper loading states to improve perceived performance

#### Testing Criteria:
- Dashboard loads with all charts and visualizations ✅
- Data is accurately represented in charts ✅
- Loading states show during data fetching ✅
- Error states handle API failures gracefully ✅
- Responsive design works on all screen sizes ✅
- Refresh functionality updates all data ✅

**Completion Date**: [Current Date]
**Notes**: Successfully implemented a comprehensive dashboard with charts, statistics, and upcoming events. The dashboard now provides valuable insights into the business with proper data visualization and metrics tracking.

**Estimated Time**: 2 days
**Dependencies**: Phases 1-4
**Key Files**:
- `src/services/dashboard-service.ts` - Service for fetching dashboard data
- `src/components/dashboard/booking-stats-chart.tsx` - Chart for booking statistics
- `src/components/dashboard/customer-growth-chart.tsx` - Chart for customer growth
- `src/components/dashboard/upcoming-events-widget.tsx` - Widget for upcoming events
- `src/components/dashboard/stats-card.tsx` - Component for displaying key metrics
- `src/app/dashboard/page.tsx` - Main dashboard page with all components

### Phase 6: API Service Layer Improvements (Priority: Medium) ✅ COMPLETED

**Objective**: Enhance the application's service layer for reliability and performance

#### Technical Details:

1. **Error Handling Standardization**: ✅ COMPLETED
   - Implemented consistent error handling across all services:
     - Used ApiResponse<T> type for all service methods
     - Added proper error logging with stack traces
     - Implemented user-friendly error messages
     - Added type guard utilities for better error detection
   - Enhanced error display in UI components:
     - Added toast notifications for transient errors
     - Implemented inline error messages for form validation
     - Created error boundary components for critical sections

2. **Response Consistency**: ✅ COMPLETED
   - Standardized all API responses to follow the same pattern:
     - Success responses include data and null error
     - Error responses include null data and error object
     - Added HTTP status code handling
   - Enhanced type safety with TypeScript interfaces
   - Improved error message clarity for debugging

3. **Service Organization**: ✅ COMPLETED
   - Restructured services for better maintainability:
     - Removed duplicate implementations (e.g., customer service)
     - Added consistent method naming across services
     - Improved code organization with clear separation of concerns
   - Enhanced documentation with JSDoc comments
   - Added type safety improvements throughout the codebase

4. **Integration Improvements**: ✅ COMPLETED
   - Fixed integration issues with external services:
     - Enhanced Supabase client integration
     - Improved Twilio SMS service reliability
     - Added proper error handling for third-party services
   - Implemented better retry logic for flaky connections
   - Added timeout handling to prevent hanging requests

5. **Service Function Consistency**: ✅ COMPLETED
   - Ensured all service functions follow consistent patterns:
     - Proper async/await implementation
     - Consistent error handling
     - Uniform return types
     - Function parameter validation
   - Added input validation to prevent invalid data
   - Improved type checking for all parameters

#### Testing Criteria:
- All services handle errors gracefully ✅
- Service responses follow consistent patterns ✅
- External service integrations work reliably ✅
- Type safety is maintained throughout the codebase ✅
- API responses include appropriate error information ✅
- Services validate input data properly ✅

**Completion Date**: [Current Date]
**Notes**: Successfully standardized the API service layer with consistent error handling, response formats, and improved reliability. The service structure is now more maintainable and provides better error information for debugging and user feedback.

**Estimated Time**: 2 days
**Dependencies**: Phases 1-5
**Key Files**:
- `src/types/index.ts` - Added ApiResponse type and error interfaces
- `src/services/*.ts` - Updated all service files with consistent patterns
- `src/lib/supabase.ts` - Enhanced Supabase client configuration
- `src/services/sms-service.ts` - Improved Twilio integration
- `src/utils/error-handling.ts` - Added error handling utilities

### Phase 7: Testing and Stabilization (Priority: High)

**Objective**: Comprehensive testing and bug fixing

#### Tasks:

1. **Functional Testing**:
   - Test all application features in various environments
   - Document and fix any discovered bugs

2. **Mobile Testing**:
   - Verify all mobile-specific functionality
   - Fix any mobile-specific layout issues

3. **Performance Testing**:
   - Test application performance under load
   - Optimize slow operations

**Estimated Time**: 2 days
**Dependencies**: Phases 1-6

### Phase 8: Documentation and Deployment (Priority: Medium)

**Objective**: Update documentation and deploy the fixed application

#### Tasks:

1. **Documentation Updates**:
   - Update technical documentation with all fixes and changes
   - Create user guides for any changed functionality

2. **Deployment Process**:
   - Create a deployment checklist
   - Document the verification process for deployed changes

3. **Final Deployment**:
   - Deploy fixes to production
   - Verify all functionality in the production environment

**Estimated Time**: 1 day
**Dependencies**: Phases 1-7

## Timeline and Resources

Total estimated time: 13 days

### Prioritized Implementation Schedule:

1. **Week 1**:
   - Days 1-2: Fix routing structure and customer management
   - Days 3-4: Fix events, categories, and booking management
   - Day 5: Begin dashboard visualizations

2. **Week 2**:
   - Days 1-2: Complete dashboard visualizations and API service improvements
   - Days 3-4: Testing and stabilization
   - Day 5: Documentation and deployment

### Resource Requirements:

- 1 Full-stack developer
- 1 QA tester for validation
- Access to development, staging, and production environments
- Access to Supabase backend
- Access to Twilio account for SMS testing

## Success Criteria

The implementation will be considered successful when:

1. All 404 errors are resolved
2. All CRUD operations work as expected for customers, events, categories, and bookings
3. Dashboard displays appropriate charts and statistics
4. All forms properly submit and redirect
5. Delete operations function correctly with proper confirmation
6. Mobile functionality works as expected
7. No regression bugs are introduced

## Risk Management

### Potential Risks:

1. **Database Schema Issues**: Schema inconsistencies might be causing some API failures
   - Mitigation: Review and align database schema with application models

2. **Third-party Service Failures**: Twilio or other services might be failing
   - Mitigation: Implement proper fallbacks and error handling

3. **Deployment Issues**: Changes might not correctly deploy to production
   - Mitigation: Create detailed deployment checklist and verification steps

4. **Regression Bugs**: Fixing one issue might create another
   - Mitigation: Implement comprehensive testing after each phase 