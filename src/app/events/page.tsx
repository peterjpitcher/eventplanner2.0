'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { EventList } from '@/components/events/event-list';
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
            <EventList events={events} />
          )}
        </div>
      </div>
    </AppLayout>
  );
} 