import { supabase } from '@/lib/supabase';
import { subDays, format, startOfMonth, endOfMonth } from 'date-fns';
import { Activity } from '@/components/dashboard/recent-activity';

interface Booking {
  id: string;
  created_at: string;
  event: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
    };
  };
  customer: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  customer: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface CategoryBooking {
  id: string;
  event: {
    id: string;
    category: {
      id: string;
      name: string;
    };
  };
}

interface BookingWithEvent {
  id: string;
  created_at: string;
  event: {
    id: string;
    name: string;
  };
  customer: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

// Define proper types for Supabase responses
interface SupabaseBooking {
  id: string;
  created_at: string;
  event_id: string;
  event?: {
    id: string;
    title?: string;
    category_id?: string;
    category?: {
      id: string;
      name: string;
    }[];
  }[];
  customer?: {
    id: string;
    first_name?: string;
    last_name?: string;
  }[];
}

interface SupabaseMessage {
  id: string;
  content?: string;
  created_at: string;
  customer?: {
    id: string;
    first_name?: string;
    last_name?: string;
  }[];
}

interface ActivityItem {
  id: string;
  type: 'booking' | 'message';
  content: string;
  timestamp: string;
}

type SupabaseResponse<T> = {
  data: T | null;
  error: any;
};

export async function getDashboardStats() {
  try {
    // Get current counts
    const [
      { count: customerCount },
      { count: eventCount },
      { count: bookingCount },
      { count: messageCount }
    ] = await Promise.all([
      supabase.from('customers').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true })
    ]);

    // Get customer growth
    const thirtyDaysAgo = subDays(new Date(), 30);
    const sixtyDaysAgo = subDays(new Date(), 60);

    const [
      { count: newCustomers30 },
      { count: oldCustomers30 },
      { count: newCustomers60 },
      { count: oldCustomers60 }
    ] = await Promise.all([
      supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString()),
      supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', thirtyDaysAgo.toISOString()),
      supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sixtyDaysAgo.toISOString()),
      supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', sixtyDaysAgo.toISOString())
    ]);

    const customerGrowth = {
      last30Days: oldCustomers30 ? ((newCustomers30 || 0) / oldCustomers30) * 100 : 0,
      last60Days: oldCustomers60 ? ((newCustomers60 || 0) / oldCustomers60) * 100 : 0
    };

    return {
      customerCount: customerCount || 0,
      eventCount: eventCount || 0,
      bookingCount: bookingCount || 0,
      messageCount: messageCount || 0,
      customerGrowth
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
}

export async function getCategoryBookingData() {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        event_id,
        event:events (
          id,
          category_id,
          category:event_categories (
            id,
            name
          )
        )
      `);

    if (error) throw error;

    if (!bookings || bookings.length === 0) {
      return { labels: ['No Data'], data: [1] };
    }

    // Process the data to get category counts
    const categoryCounts = (bookings as SupabaseBooking[]).reduce((acc: Record<string, number>, booking) => {
      // Access category name safely
      const categoryName = booking.event?.[0]?.category?.[0]?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(categoryCounts),
      data: Object.values(categoryCounts)
    };
  } catch (error) {
    console.error('Error fetching category booking data:', error);
    return { labels: ['Error'], data: [0] };
  }
}

export async function getMonthlyBookingData() {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        created_at,
        event_id,
        event:events (
          id,
          category_id,
          category:event_categories (
            id,
            name
          )
        )
      `)
      .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString());

    if (error) throw error;

    if (!bookings || bookings.length === 0) {
      // Create empty monthly data for the last 6 months
      const months = [];
      const monthsData = [];
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.unshift(date.toLocaleString('default', { month: 'short' }));
        monthsData.unshift(0);
      }
      return {
        labels: months,
        data: monthsData
      };
    }

    // Process the data to get monthly counts
    const monthlyCounts: Record<string, number> = {};
    
    // Initialize with empty months for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      monthlyCounts[month] = 0;
    }

    // Fill in actual booking counts
    bookings.forEach(booking => {
      const month = new Date(booking.created_at).toLocaleString('default', { month: 'short' });
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    return {
      labels: Object.keys(monthlyCounts),
      data: Object.values(monthlyCounts)
    };
  } catch (error) {
    console.error('Error fetching monthly booking data:', error);
    return { labels: [], data: [] };
  }
}

export async function getRecentActivity(): Promise<ActivityItem[]> {
  try {
    // Fetch recent bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        created_at,
        event:events (
          id,
          title
        ),
        customer:customers (
          id,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (bookingsError) throw bookingsError;

    // Fetch recent messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        customer:customers (
          id,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (messagesError && messagesError.code !== 'PGRST116') {
      // PGRST116 is "relation does not exist" which means the table is empty or not created yet
      // We'll just proceed with empty messages in that case
      if (messagesError.code !== '42P01') {  // 42P01 is PostgreSQL's "table does not exist"
        throw messagesError;
      }
    }

    // Combine and sort activities
    const bookingActivities: ActivityItem[] = (bookings || []).map((booking) => {
      // Ensure booking has the required structure
      const typedBooking: SupabaseBooking = {
        id: booking.id,
        created_at: booking.created_at,
        event_id: booking.event?.[0]?.id || '',
        event: booking.event,
        customer: booking.customer
      };
      
      return {
        id: typedBooking.id,
        type: 'booking',
        content: `${typedBooking.customer?.[0]?.first_name || ''} ${typedBooking.customer?.[0]?.last_name || ''} booked ${typedBooking.event?.[0]?.title || 'an event'}`,
        timestamp: typedBooking.created_at
      };
    });

    const messageActivities: ActivityItem[] = (messages || []).map((message: SupabaseMessage) => ({
      id: message.id,
      type: 'message',
      content: `Message from ${message.customer?.[0]?.first_name || ''} ${message.customer?.[0]?.last_name || ''}: ${message.content || ''}`,
      timestamp: message.created_at
    }));

    // Combine all activities
    const allActivities: ActivityItem[] = [...bookingActivities, ...messageActivities];
    
    // Sort by timestamp (newest first) and limit to 5
    return allActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
} 