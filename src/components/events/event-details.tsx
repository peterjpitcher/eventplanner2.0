import React from 'react';
import { Event } from '@/services/event-service';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDate, formatDateWithYear, formatTime } from '@/lib/date-utils';

interface EventDetailsProps {
  event: Event;
}

export function EventDetails({ event }: EventDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Category</h3>
          <p className="mt-1 text-sm text-gray-900">{event.category_name}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Date</h3>
          <p className="mt-1 text-sm text-gray-900">
            {formatDateWithYear(event.date)}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Time</h3>
          <p className="mt-1 text-sm text-gray-900">
            {formatTime(event.start_time)}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Capacity</h3>
          <p className="mt-1 text-sm text-gray-900">{event.capacity} attendees</p>
        </div>
        
        <div className="md:col-span-2">
          <h3 className="text-sm font-medium text-gray-500">Description</h3>
          <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
            {event.description || 'No description provided'}
          </p>
        </div>
        
        {event.notes && (
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{event.notes}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Link href={`/events/${event.id}/edit`}>
          <Button variant="outline">Edit Event</Button>
        </Link>
        <Link href="/events">
          <Button variant="secondary">Back to Events</Button>
        </Link>
      </div>
    </div>
  );
} 