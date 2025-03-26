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

      // Get upcoming events
      const { data: upcomingEvents, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(5);
      
      if (eventsError) throw eventsError;

      // Get booking counts by month
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('created_at')
        .gte('created_at', subMonths(new Date(), 6).toISOString());
      
      if (bookingsError) throw bookingsError;

      // Get customer growth by month
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('created_at')
        .gte('created_at', subMonths(new Date(), 6).toISOString());
      
      if (customersError) throw customersError;

      // Get total counts
      const [
        { count: totalCustomers, error: totalCustomersError },
        { count: totalBookings, error: totalBookingsError },
        { count: totalEvents, error: totalEventsError }
      ] = await Promise.all([
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true })
      ]);

      if (totalCustomersError || totalBookingsError || totalEventsError) {
        throw new Error('Failed to fetch totals');
      }

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

      return {
        data: {
          upcomingEvents: upcomingEvents || [],
          bookingStats,
          customerGrowth,
          totalCustomers: totalCustomers || 0,
          totalBookings: totalBookings || 0,
          totalEvents: totalEvents || 0
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return { data: null, error: error as Error };
    }
  }
};

export default dashboardService; 