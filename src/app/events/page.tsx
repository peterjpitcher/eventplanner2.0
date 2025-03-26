'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { EventList } from '@/components/events/event-list';
import { EventCard } from '@/components/events/event-card';
import { eventService } from '@/services/event-service';
import { Event } from '@/services/event-service';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/ui/page-header';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await eventService.getEvents();

        if (error) {
          console.error('Error fetching events:', error);
          setError(error);
        } else {
          setEvents(data || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Render based on screen size
  const renderEvents = () => {
    if (events.length === 0) {
      return (
        <div className="text-center py-10">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new event.</p>
          <div className="mt-6">
            <Link
              href="/events/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Event
            </Link>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Desktop view */}
        <div className="hidden md:block">
          <EventList events={events} />
        </div>
        
        {/* Mobile view */}
        <div className="md:hidden px-4">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </>
    );
  };

  return (
    <AppLayout>
      <div className="py-6">
        <PageHeader
          title="Events"
          description="Manage your upcoming and past events"
          action={{
            label: 'Add Event',
            href: '/events/new'
          }}
          secondaryAction={{
            label: 'Manage Categories',
            href: '/categories'
          }}
        />
        
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg p-6">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-600">Error loading events: {error.message}</div>
            </div>
          ) : (
            renderEvents()
          )}
        </div>
      </div>
    </AppLayout>
  );
} 