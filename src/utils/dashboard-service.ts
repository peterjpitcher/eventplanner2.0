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
        event:events (
          id,
          category:categories (
            id,
            name
          )
        )
      `);

    if (error) throw error;

    // Group bookings by category
    const categoryCounts = (bookings as unknown as CategoryBooking[]).reduce((acc: { [key: string]: number }, booking) => {
      const categoryName = booking.event?.category?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(categoryCounts),
      data: Object.values(categoryCounts)
    };
  } catch (error) {
    console.error('Error fetching category booking data:', error);
    return { labels: [], data: [] };
  }
}

export async function getMonthlyBookingData() {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(180); // Last 6 months

    if (error) throw error;

    // Group bookings by month
    const monthlyCounts = bookings.reduce((acc: { [key: string]: number }, booking) => {
      const month = format(new Date(booking.created_at), 'MMM yyyy');
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(monthlyCounts),
      data: Object.values(monthlyCounts)
    };
  } catch (error) {
    console.error('Error fetching monthly booking data:', error);
    return { labels: [], data: [] };
  }
}

export async function getRecentActivity(): Promise<Activity[]> {
  try {
    const [
      { data: bookings },
      { data: customers },
      { data: messages }
    ] = await Promise.all([
      supabase
        .from('bookings')
        .select(`
          id,
          created_at,
          event:events (
            id,
            name
          ),
          customer:customers (
            id,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('customers')
        .select('id, first_name, last_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('messages')
        .select('id, content, created_at, customer:customers (id, first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    const activities: Activity[] = [
      ...((bookings as unknown as BookingWithEvent[])?.map(booking => ({
        id: booking.id,
        type: 'booking' as const,
        title: `New booking for ${booking.event?.name}`,
        description: `Booked by ${booking.customer?.first_name} ${booking.customer?.last_name}`,
        timestamp: booking.created_at,
        link: `/bookings/${booking.id}`
      })) || []),
      ...((customers as unknown as Customer[])?.map(customer => ({
        id: customer.id,
        type: 'customer' as const,
        title: 'New customer added',
        description: `${customer.first_name} ${customer.last_name}`,
        timestamp: customer.created_at,
        link: `/customers/${customer.id}`
      })) || []),
      ...((messages as unknown as Message[])?.map(message => ({
        id: message.id,
        type: 'message' as const,
        title: 'New message received',
        description: `From ${message.customer?.first_name} ${message.customer?.last_name}`,
        timestamp: message.created_at,
        link: `/messages/${message.id}`
      })) || [])
    ];

    // Sort all activities by timestamp
    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
} 