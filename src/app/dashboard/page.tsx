'use client';

import React, { useEffect, useState } from 'react';
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

  // Format the timestamp for last refreshed
  const lastRefreshed = new Date().toLocaleTimeString();

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
          <p className="font-semibold">Error loading dashboard data</p>
          <p className="text-sm mt-1">{error.message || 'Please try again later'}</p>
          <p className="text-xs mt-2">Some data may be unavailable or incomplete.</p>
        </Alert>
      )}

      <div className="text-xs text-gray-500 mb-4">
        Last updated: {lastRefreshed}
      </div>

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
    </AppLayout>
  );
}
