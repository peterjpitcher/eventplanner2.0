'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { EventList } from '@/components/events/event-list';
import { eventService } from '@/services/event-service';
import { Event } from '@/services/event-service';
import { AppLayout } from '@/components/layout/app-layout';

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
          <Link href="/events/new">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Event
            </button>
          </Link>
        </div>
        
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