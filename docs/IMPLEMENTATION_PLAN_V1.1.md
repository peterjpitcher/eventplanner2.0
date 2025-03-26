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

### Phase 2: Fix Customer Management (Priority: High)

**Objective**: Restore full functionality to customer management features

#### Technical Details:

1. **Customer List Fixes**:
   - Examine `src/services/customer-service.ts` for API integration issues
   - Check for proper error handling in the `getCustomers()` method:
   ```typescript
   // Expected implementation:
   export const getCustomers = async (): Promise<{ data: Customer[] | null; error: Error | null }> => {
     try {
       const { data, error } = await supabase
         .from('customers')
         .select('*')
         .order('created_at', { ascending: false });
       
       return { data, error };
     } catch (error) {
       console.error('Error fetching customers:', error);
       return { data: null, error: error as Error };
     }
   };
   ```
   
   - Update the customer list component in `src/components/customers/customer-list.tsx`:
   ```tsx
   // Add proper loading state and error handling
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<Error | null>(null);
   
   // Ensure data fetching is wrapped in try/catch
   try {
     const { data, error } = await customerService.getCustomers();
     if (error) throw error;
     setCustomers(data || []);
   } catch (err) {
     setError(err as Error);
     // Show error UI
   } finally {
     setIsLoading(false);
   }
   ```

2. **Customer CRUD Operations**:
   - Fix customer creation form in `src/app/customers/new/page.tsx`:
     - Ensure form submission handles errors properly
     - Add explicit redirect after successful submission:
     ```tsx
     const router = useRouter();
     
     const onSubmit = async (data: CustomerFormData) => {
       setIsSubmitting(true);
       try {
         const result = await customerService.createCustomer(data);
         if (result.error) throw result.error;
         router.push('/customers');
       } catch (error) {
         setError('Failed to create customer');
         console.error(error);
       } finally {
         setIsSubmitting(false);
       }
     };
     ```
   
   - Fix customer editing in `src/app/customers/[id]/edit/page.tsx`:
     - Similar error handling and redirect logic
     - Ensure form is pre-populated with customer data
   
   - Fix customer deletion:
     - Check `deleteCustomer()` method in customer service
     - Ensure confirmation dialog is functional
     - Add proper error handling and UI feedback

3. **Testing Methods**:
   - Test customer listing:
     - Navigate to `/customers` and verify customer list loads
     - Test search functionality if available
   
   - Test customer creation:
     - Navigate to `/customers/new`
     - Fill and submit the form
     - Verify redirect to customer list
     - Verify new customer appears in list
   
   - Test customer editing:
     - Select a customer and navigate to edit page
     - Make changes and submit
     - Verify changes appear in list
   
   - Test customer deletion:
     - Select a customer to delete
     - Confirm deletion
     - Verify customer is removed from list

#### Testing Criteria:
- Customer list loads successfully with data
- Customer creation form submits and redirects correctly
- Customer editing form loads, submits, and redirects correctly
- Customer deletion works with confirmation
- Proper error messages appear when operations fail

**Estimated Time**: 1 day
**Dependencies**: Phase 1
**Key Files**:
- `src/services/customer-service.ts` - Service for API operations
- `src/components/customers/customer-list.tsx` - List component
- `src/components/customers/customer-form.tsx` - Form component
- `src/app/customers/new/page.tsx` - New customer page
- `src/app/customers/[id]/edit/page.tsx` - Edit customer page

### Phase 3: Fix Events and Categories (Priority: High)

**Objective**: Restore functionality to event and category management

#### Technical Details:

1. **Categories Management**:
   - Examine `src/services/event-category-service.ts`:
     - Check all CRUD methods for error handling
     - Ensure proper return types and error objects
   
   - Fix category listing in `src/components/categories/category-list.tsx`:
     ```tsx
     // Add loading state, error handling, and data fetching in useEffect
     useEffect(() => {
       const fetchCategories = async () => {
         setIsLoading(true);
         try {
           const { data, error } = await eventCategoryService.getCategories();
           if (error) throw error;
           setCategories(data || []);
         } catch (err) {
           setError('Failed to load categories');
           console.error(err);
         } finally {
           setIsLoading(false);
         }
       };
       
       fetchCategories();
     }, []);
     ```
   
   - Update category form components to handle submission properly:
     - Add loading state during submission
     - Add error handling with user feedback
     - Add redirect after successful operations
     - Use AppLayout consistently

2. **Events Management**:
   - Similar fixes to event service and components:
     - Check `src/services/event-service.ts` for proper error handling
     - Update event list component with loading and error states
     - Fix event form submission and redirection
   
   - For event detail view in `src/app/events/[id]/page.tsx`:
     - Ensure data fetching includes error handling
     - Verify all actions (edit, delete) work correctly
     - Check that related bookings are properly displayed

3. **Deletion Functionality**:
   - For both events and categories, ensure deletion includes:
     - Confirmation dialog to prevent accidental deletion
     - Proper error handling if deletion fails
     - UI feedback on success or failure
     - Data refetching after successful deletion

#### Testing Criteria:
- Category list loads with data
- Category creation, editing, and deletion work properly
- Event list loads with data
- Event creation, editing, and deletion work properly
- Event detail view shows all relevant information
- All forms submit with proper validation
- All operations show appropriate loading states and error messages

**Estimated Time**: 2 days
**Dependencies**: Phase 1
**Key Files**:
- `src/services/event-category-service.ts`
- `src/services/event-service.ts`
- `src/components/categories/*`
- `src/components/events/*`
- `src/app/categories/*`
- `src/app/events/*`

### Phase 4: Fix Booking Management (Priority: High)

**Objective**: Restore full functionality to booking management

#### Technical Details:

1. **Booking List Integration**:
   - Examine `src/services/booking-service.ts` for API issues:
     - Check the `getBookings()` method
     - Add proper error handling and return types
   
   - Fix booking list component:
     ```tsx
     // Implement proper data fetching with loading and error states
     const fetchBookings = async () => {
       setIsLoading(true);
       try {
         const { data, error } = await bookingService.getBookings(eventId);
         if (error) throw error;
         setBookings(data || []);
       } catch (err) {
         setError('Failed to load bookings');
         console.error(err);
       } finally {
         setIsLoading(false);
       }
     };
     ```

2. **Booking Creation Flow**:
   - Fix the QuickBook component in `src/components/bookings/quick-book.tsx`:
     - Diagnose form submission issue - likely missing preventDefault()
     - Add proper loading state during submission
     - Add explicit redirection after successful submission
     ```tsx
     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault(); // Prevent page reload
       setIsSubmitting(true);
       
       try {
         const { error } = await bookingService.createBooking({
           customer_id: selectedCustomer?.id,
           event_id: eventId,
           seats_or_reminder: seatsOrReminder,
           notes: notes
         });
         
         if (error) throw error;
         
         // Clear form and show success
         setSelectedCustomer(null);
         setSeatsOrReminder('');
         setNotes('');
         setSuccess(true);
         
         // Refetch bookings
         fetchBookings();
       } catch (err) {
         setError('Failed to create booking');
         console.error(err);
       } finally {
         setIsSubmitting(false);
       }
     };
     ```

3. **Booking Editing and Detail View**:
   - Fix booking detail view:
     - Ensure proper data fetching with error handling
     - Verify all UI elements display correctly
   
   - Fix booking editing functionality:
     - Update the form submission handler
     - Add proper validation and error handling
     - Ensure redirect after successful edit

4. **Testing Methods**:
   - For booking listing:
     - Navigate to an event detail view
     - Verify bookings are displayed
   
   - For booking creation:
     - Use the QuickBook feature to create a booking
     - Verify it appears in the list without page reload
   
   - For booking editing:
     - Edit an existing booking
     - Verify changes are saved and displayed
   
   - For booking deletion:
     - Delete a booking
     - Verify it's removed from the list

#### Testing Criteria:
- Booking list loads successfully
- QuickBook form creates bookings without page reload
- Booking detail view shows all information
- Editing a booking works and shows changes
- Deleting a booking works with confirmation

**Estimated Time**: 2 days
**Dependencies**: Phases 1 and 3
**Key Files**:
- `src/services/booking-service.ts`
- `src/components/bookings/quick-book.tsx`
- `src/components/bookings/booking-list.tsx`
- `src/app/bookings/[id]/page.tsx`
- `src/app/bookings/[id]/edit/page.tsx`

### Phase 5: Implement Dashboard Visualizations (Priority: Medium)

**Objective**: Add the missing graphs and charts to the dashboard

#### Technical Details:

1. **Dashboard Data Service**:
   - Create or update `src/services/dashboard-service.ts` to include:
     ```typescript
     // Methods for fetching dashboard data
     export const getDashboardStats = async () => {
       try {
         // Fetch upcoming events
         const { data: upcomingEvents, error: eventsError } = await supabase
           .from('events')
           .select('*')
           .gte('start_time', new Date().toISOString())
           .order('start_time', { ascending: true })
           .limit(5);
         
         // Fetch booking counts
         const { data: bookingStats, error: bookingError } = await supabase
           .rpc('get_booking_stats_by_month'); // Custom database function
         
         // Fetch customer growth
         const { data: customerGrowth, error: customerError } = await supabase
           .rpc('get_customer_growth_by_month'); // Custom database function
         
         if (eventsError || bookingError || customerError) {
           throw new Error('Failed to fetch dashboard data');
         }
         
         return {
           upcomingEvents,
           bookingStats,
           customerGrowth,
           error: null
         };
       } catch (error) {
         console.error('Dashboard data error:', error);
         return {
           upcomingEvents: null,
           bookingStats: null,
           customerGrowth: null,
           error
         };
       }
     };
     ```

2. **Chart Implementation**:
   - Add chart library dependency:
     ```bash
     npm install chart.js react-chartjs-2
     ```
   
   - Create booking statistics chart component:
     ```tsx
     // src/components/dashboard/booking-stats-chart.tsx
     import { Line } from 'react-chartjs-2';
     import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
     
     Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
     
     type BookingStatsProps = {
       data: {
         month: string;
         count: number;
       }[];
       isLoading: boolean;
     };
     
     export function BookingStatsChart({ data, isLoading }: BookingStatsProps) {
       if (isLoading) {
         return <div className="h-64 flex items-center justify-center">Loading stats...</div>;
       }
       
       if (!data || data.length === 0) {
         return <div className="h-64 flex items-center justify-center">No booking data available</div>;
       }
       
       const chartData = {
         labels: data.map(item => item.month),
         datasets: [
           {
             label: 'Bookings',
             data: data.map(item => item.count),
             borderColor: 'rgb(59, 130, 246)',
             backgroundColor: 'rgba(59, 130, 246, 0.5)',
           },
         ],
       };
       
       return (
         <div className="h-64">
           <Line 
             data={chartData}
             options={{
               responsive: true,
               maintainAspectRatio: false,
               plugins: {
                 legend: {
                   position: 'top' as const,
                 },
                 title: {
                   display: true,
                   text: 'Bookings by Month',
                 },
               },
             }}
           />
         </div>
       );
     }
     ```

3. **Dashboard Page Update**:
   - Update `src/app/dashboard/page.tsx` to include visualizations:
     ```tsx
     'use client';
     
     import { useEffect, useState } from 'react';
     import { AppLayout } from '@/components/layout/app-layout';
     import { PageHeader } from '@/components/ui/page-header';
     import { BookingStatsChart } from '@/components/dashboard/booking-stats-chart';
     import { CustomerGrowthChart } from '@/components/dashboard/customer-growth-chart';
     import { UpcomingEventsWidget } from '@/components/dashboard/upcoming-events-widget';
     import { dashboardService } from '@/services/dashboard-service';
     
     export default function Dashboard() {
       const [isLoading, setIsLoading] = useState(true);
       const [error, setError] = useState<Error | null>(null);
       const [dashboardData, setDashboardData] = useState({
         upcomingEvents: [],
         bookingStats: [],
         customerGrowth: []
       });
       
       useEffect(() => {
         const fetchDashboardData = async () => {
           setIsLoading(true);
           try {
             const { upcomingEvents, bookingStats, customerGrowth, error } = 
               await dashboardService.getDashboardStats();
             
             if (error) throw error;
             
             setDashboardData({
               upcomingEvents: upcomingEvents || [],
               bookingStats: bookingStats || [],
               customerGrowth: customerGrowth || []
             });
           } catch (err) {
             setError(err as Error);
             console.error('Failed to load dashboard data:', err);
           } finally {
             setIsLoading(false);
           }
         };
         
         fetchDashboardData();
       }, []);
       
       return (
         <AppLayout>
           <PageHeader
             title="Dashboard"
             description="Overview of your event planning"
           />
           
           {error && (
             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
               Failed to load dashboard data. Please try again later.
             </div>
           )}
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
             <div className="bg-white shadow-md rounded-lg p-4">
               <h2 className="text-lg font-medium mb-4">Booking Statistics</h2>
               <BookingStatsChart 
                 data={dashboardData.bookingStats} 
                 isLoading={isLoading} 
               />
             </div>
             
             <div className="bg-white shadow-md rounded-lg p-4">
               <h2 className="text-lg font-medium mb-4">Customer Growth</h2>
               <CustomerGrowthChart 
                 data={dashboardData.customerGrowth} 
                 isLoading={isLoading} 
               />
             </div>
           </div>
           
           <div className="bg-white shadow-md rounded-lg p-4">
             <h2 className="text-lg font-medium mb-4">Upcoming Events</h2>
             <UpcomingEventsWidget 
               events={dashboardData.upcomingEvents} 
               isLoading={isLoading} 
             />
           </div>
           
           {/* Quick navigation links */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
             {/* Original navigation buttons */}
           </div>
         </AppLayout>
       );
     }
     ```

4. **Performance Considerations**:
   - Add data caching using SWR or React Query
   - Consider server-side data fetching for initial load
   - Optimize chart rendering for performance

#### Testing Criteria:
- Dashboard loads with all charts and visualizations
- Data is accurately represented in charts
- Loading states show during data fetching
- Error states handle API failures gracefully
- Responsive design works on all screen sizes

**Estimated Time**: 2 days
**Dependencies**: Phases 1-4
**Key Files**:
- `src/services/dashboard-service.ts`
- `src/components/dashboard/*` (new chart components)
- `src/app/dashboard/page.tsx`

### Phase 6: API Service Layer Improvements (Priority: Medium)

**Objective**: Enhance the application's service layer for reliability and performance

#### Tasks:

1. **Error Handling**:
   - Implement consistent error handling across all services
   - Add proper user feedback for API failures

2. **Caching Strategy**:
   - Implement data caching for frequently accessed data
   - Add revalidation strategies for stale data

3. **Performance Improvements**:
   - Optimize API calls to reduce payload size
   - Implement pagination for large data sets

**Estimated Time**: 2 days
**Dependencies**: Phases 1-4

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