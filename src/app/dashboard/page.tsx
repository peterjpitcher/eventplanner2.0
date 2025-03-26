'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { AppLayout } from '@/components/layout/app-layout';
import { BookingStatsChart } from '@/components/dashboard/booking-stats-chart';
import { CustomerGrowthChart } from '@/components/dashboard/customer-growth-chart';
import { UpcomingEventsWidget } from '@/components/dashboard/upcoming-events-widget';
import { StatsCard } from '@/components/dashboard/stats-card';
import { dashboardService, DashboardStats } from '@/services/dashboard-service';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { UsersIcon, CalendarIcon, TicketIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardStats>({
    upcomingEvents: [],
    bookingStats: [],
    customerGrowth: [],
    totalCustomers: 0,
    totalBookings: 0,
    totalEvents: 0
  });
  
  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const { data, error } = await dashboardService.getDashboardStats();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setDashboardData(data);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <PageHeader
          title="Dashboard"
          description="Overview of your event planning business"
        />
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing} 
          variant="outline"
          size="sm"
        >
          {isRefreshing ? (
            <>
              <Spinner size="sm" className="mr-2" />
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <RefreshCwIcon size={16} className="mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>
      
      {error && (
        <Alert variant="error" className="mb-6">
          Failed to load dashboard data. Please try again later.
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Total Customers"
          value={dashboardData.totalCustomers}
          icon={<UsersIcon size={20} />}
          isLoading={isLoading}
          color="blue"
        />
        <StatsCard
          title="Total Events"
          value={dashboardData.totalEvents}
          icon={<CalendarIcon size={20} />}
          isLoading={isLoading}
          color="green"
        />
        <StatsCard
          title="Total Bookings"
          value={dashboardData.totalBookings}
          icon={<TicketIcon size={20} />}
          isLoading={isLoading}
          color="purple"
        />
      </div>
      
      {/* Charts */}
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
      
      {/* Upcoming Events */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-lg font-medium mb-4">Upcoming Events</h2>
        <UpcomingEventsWidget 
          events={dashboardData.upcomingEvents} 
          isLoading={isLoading} 
        />
      </div>
      
      {/* Quick Navigation Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/events" className="block p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
          <h3 className="font-medium text-blue-700">Manage Events</h3>
          <p className="text-sm text-blue-600 mt-1">View, create, and edit your events</p>
        </Link>
        
        <Link href="/customers" className="block p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
          <h3 className="font-medium text-green-700">Customer Directory</h3>
          <p className="text-sm text-green-600 mt-1">Browse and manage your customers</p>
        </Link>
        
        <Link href="/bookings" className="block p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
          <h3 className="font-medium text-purple-700">Booking Management</h3>
          <p className="text-sm text-purple-600 mt-1">Handle event bookings and reservations</p>
        </Link>
        
        <Link href="/categories" className="block p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors">
          <h3 className="font-medium text-yellow-700">Event Categories</h3>
          <p className="text-sm text-yellow-600 mt-1">Organize events by categories</p>
        </Link>
      </div>
    </AppLayout>
  );
}
