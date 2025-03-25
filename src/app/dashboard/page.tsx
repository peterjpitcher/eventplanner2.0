import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { eventService } from '@/services/event-service';
import { customerService } from '@/services/customer-service';
import { formatDateTime } from '@/lib/date-utils';

export const metadata = {
  title: 'Dashboard | Event Planner',
  description: 'Event Planner Dashboard',
};

export default async function Dashboard() {
  const { data: upcomingEvents } = await eventService.getUpcomingEvents(5);
  const { data: customers } = await customerService.getCustomers();

  const customerCount = customers?.length || 0;
  
  return (
    <div className="container py-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your event planning"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Quick Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Customers</p>
              <p className="text-2xl font-bold">{customerCount}</p>
              <Link href="/customers" className="text-sm text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Upcoming Events</p>
              <p className="text-2xl font-bold">{upcomingEvents?.length || 0}</p>
              <Link href="/events" className="text-sm text-blue-600 hover:underline">
                View all
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/events/new" passHref>
              <Button fullWidth>Create Event</Button>
            </Link>
            <Link href="/customers/new" passHref>
              <Button variant="outline" fullWidth>Add Customer</Button>
            </Link>
            <Link href="/categories/new" passHref>
              <Button variant="outline" fullWidth>Add Category</Button>
            </Link>
            <Link href="/settings" passHref>
              <Button variant="secondary" fullWidth>Settings</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Upcoming Events</h2>
          <Link href="/events" className="text-sm text-blue-600 hover:underline">
            View all events
          </Link>
        </div>
        
        {upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-6 hover:bg-gray-50">
                <Link href={`/events/${event.id}`} className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-medium text-gray-900">{event.title}</h3>
                    {event.category && (
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: event.category.color }} 
                        />
                        <span className="text-sm text-gray-500">{event.category.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {formatDateTime(event.date, event.start_time)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {event.location || 'No location'}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500 mb-4">You don&apos;t have any upcoming events.</p>
            <Link href="/events/new" passHref>
              <Button>Create Your First Event</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 