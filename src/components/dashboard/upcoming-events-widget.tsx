'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { Spinner } from '../ui/spinner';
import { CalendarIcon, UsersIcon, MapPinIcon } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  venue: string;
  capacity: number;
  category_id: string;
  created_at: string;
}

interface UpcomingEventsWidgetProps {
  events: Event[];
  isLoading: boolean;
}

export function UpcomingEventsWidget({ events, isLoading }: UpcomingEventsWidgetProps) {
  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <Spinner />
        <span className="ml-2 text-sm text-gray-500">Loading upcoming events...</span>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center text-gray-500 py-8">
        <p className="mb-4">No upcoming events scheduled</p>
        <Link 
          href="/events/new" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Create an Event
        </Link>
      </div>
    );
  }

  const formatEventDateTime = (date: string, time: string) => {
    try {
      // Try to parse the combined date and time
      const dateTime = parseISO(`${date}T${time}`);
      return format(dateTime, 'EEEE, do MMMM yyyy - HH:mm');
    } catch (error) {
      // Fallback in case of parsing error
      return `${date} ${time}`;
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      {events.map((event) => (
        <div key={event.id} className="py-4 first:pt-0 last:pb-0">
          <Link href={`/events/${event.id}`} className="hover:bg-gray-50 block rounded-md px-2 py-1 transition-colors">
            <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
            
            <div className="mt-2 flex flex-col space-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                <span>{formatEventDateTime(event.date, event.start_time)}</span>
              </div>
              
              {event.venue && (
                <div className="flex items-center">
                  <MapPinIcon className="mr-2 h-4 w-4 text-gray-400" />
                  <span>{event.venue}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <UsersIcon className="mr-2 h-4 w-4 text-gray-400" />
                <span>Capacity: {event.capacity}</span>
              </div>
            </div>
          </Link>
        </div>
      ))}
      
      <div className="pt-4 flex justify-end">
        <Link 
          href="/events" 
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
        >
          View all events →
        </Link>
      </div>
    </div>
  );
} 