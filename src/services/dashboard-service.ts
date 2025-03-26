import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types';
import { format, subMonths, startOfMonth, parseISO } from 'date-fns';

// Types for dashboard data
export interface BookingStat {
  month: string;
  count: number;
}

export interface CustomerGrowth {
  month: string;
  count: number;
}

export interface DashboardStats {
  upcomingEvents: any[];
  bookingStats: BookingStat[];
  customerGrowth: CustomerGrowth[];
  totalCustomers: number;
  totalBookings: number;
  totalEvents: number;
}

// Default empty stats for fallback
const DEFAULT_STATS: DashboardStats = {
  upcomingEvents: [],
  bookingStats: Array.from({ length: 6 }, (_, i) => ({
    month: format(subMonths(new Date(), 5 - i), 'MMM yyyy'),
    count: 0
  })),
  customerGrowth: Array.from({ length: 6 }, (_, i) => ({
    month: format(subMonths(new Date(), 5 - i), 'MMM yyyy'),
    count: 0
  })),
  totalCustomers: 0,
  totalBookings: 0,
  totalEvents: 0
};

export const dashboardService = {
  /**
   * Get all dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      // Generate last 6 months for consistent data
      const months = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(new Date(), i);
        return format(date, 'yyyy-MM');
      }).reverse();

      // Create partial stats object to fill as we go
      let partialStats: Partial<DashboardStats> = {};

      // Get upcoming events - if this fails, we use empty array
      try {
        // Generate current date in ISO format for the query
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        
        console.log('Current date for events query:', currentDate);
        
        // Query events that start in the future
        // First get events with date > today
        const { data: futureEvents, error: futureEventsError } = await supabase
          .from('events')
          .select('*')
          .gte('date', currentDate)
          .order('date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(10);
        
        if (futureEventsError) {
          console.error('Failed to fetch future events:', futureEventsError);
          partialStats.upcomingEvents = [];
        } else {
          // Filter events for today to only include those that haven't started yet
          const upcomingEvents = futureEvents?.filter(event => {
            if (event.date > currentDate) return true; // Future date, definitely upcoming
            
            if (event.date === currentDate) {
              // Today's event - check if time is in the future
              const eventTime = event.start_time.split(':').map(Number);
              const currentTime = [now.getHours(), now.getMinutes()];
              
              // Compare hours and minutes
              if (eventTime[0] > currentTime[0]) return true;
              if (eventTime[0] === currentTime[0] && eventTime[1] > currentTime[1]) return true;
              return false; // Today's event that already started
            }
            
            return false; // Past date
          }).slice(0, 5); // Take only first 5 upcoming events
          
          console.log(`Found ${upcomingEvents?.length} upcoming events`);
          partialStats.upcomingEvents = upcomingEvents || [];
        }
      } catch (err) {
        console.error('Error in upcoming events query:', err);
        partialStats.upcomingEvents = [];
      }

      // Get booking counts - if this fails, we use empty stats
      try {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('created_at')
          .gte('created_at', subMonths(new Date(), 6).toISOString());
        
        if (bookingsError) {
          console.error('Failed to fetch bookings data:', bookingsError);
        } else {
          // Process booking stats by month
          const bookingStats: BookingStat[] = months.map(month => {
            const count = bookingsData?.filter(booking => {
              const bookingDate = parseISO(booking.created_at);
              const bookingMonth = format(bookingDate, 'yyyy-MM');
              return bookingMonth === month;
            })?.length || 0;

            return {
              month: format(parseISO(`${month}-01`), 'MMM yyyy'),
              count
            };
          });
          
          partialStats.bookingStats = bookingStats;
        }
      } catch (err) {
        console.error('Error in bookings query:', err);
      }

      // Get customer growth - if this fails, we use empty stats
      try {
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('created_at')
          .gte('created_at', subMonths(new Date(), 6).toISOString());
        
        if (customersError) {
          console.error('Failed to fetch customers data:', customersError);
        } else {
          // Process customer growth by month
          const customersByMonth: Record<string, number> = {};
          
          customersData?.forEach(customer => {
            const date = parseISO(customer.created_at);
            const monthKey = format(date, 'yyyy-MM');
            customersByMonth[monthKey] = (customersByMonth[monthKey] || 0) + 1;
          });

          // Create cumulative growth
          let cumulativeCount = 0;
          const customerGrowth: CustomerGrowth[] = months.map(month => {
            cumulativeCount += customersByMonth[month] || 0;
            return {
              month: format(parseISO(`${month}-01`), 'MMM yyyy'),
              count: cumulativeCount
            };
          });
          
          partialStats.customerGrowth = customerGrowth;
        }
      } catch (err) {
        console.error('Error in customers query:', err);
      }

      // Get total counts - attempt each independently
      try {
        const { count: totalCustomers, error: totalCustomersError } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });
        
        if (!totalCustomersError) {
          partialStats.totalCustomers = totalCustomers || 0;
        } else {
          console.error('Failed to fetch total customers:', totalCustomersError);
        }
      } catch (err) {
        console.error('Error in total customers query:', err);
      }
      
      try {
        const { count: totalBookings, error: totalBookingsError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true });
        
        if (!totalBookingsError) {
          partialStats.totalBookings = totalBookings || 0;
        } else {
          console.error('Failed to fetch total bookings:', totalBookingsError);
        }
      } catch (err) {
        console.error('Error in total bookings query:', err);
      }
      
      try {
        const { count: totalEvents, error: totalEventsError } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true });
        
        if (!totalEventsError) {
          partialStats.totalEvents = totalEvents || 0;
        } else {
          console.error('Failed to fetch total events:', totalEventsError);
        }
      } catch (err) {
        console.error('Error in total events query:', err);
      }

      // Merge partial stats with defaults for any missing data
      const completeStats: DashboardStats = {
        ...DEFAULT_STATS,
        ...partialStats
      };

      return {
        data: completeStats,
        error: null
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Return default stats on complete failure
      return { 
        data: DEFAULT_STATS, 
        error: error as Error 
      };
    }
  }
};

export default dashboardService; 