import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { eventService } from '@/services/event-service';
import { formatDateTime, formatDuration } from '@/lib/date-utils';
import { BookingListWrapper } from './booking-list-wrapper';
import { QuickBookWrapper } from './quick-book-wrapper';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { data: event } = await eventService.getEventById(params.id);
  
  if (!event) {
    return {
      title: 'Event Not Found | Event Planner',
      description: 'The requested event could not be found',
    };
  }
  
  return {
    title: `${event.title} | Event Planner`,
    description: event.description || 'Event details',
  };
}

export default async function EventDetailsPage({ params }: { params: { id: string } }) {
  const { data: event, error } = await eventService.getEventById(params.id);
  
  if (error || !event) {
    console.error('Error loading event:', error);
    notFound();
  }
  
  return (
    <div className="container py-6">
      <div className="flex justify-between items-start mb-6">
        <PageHeader
          title={event.title}
          description={event.is_published ? 'Published event' : 'Draft event'}
        />
        <div className="flex space-x-2">
          <Link href={`/events/${event.id}/edit`} passHref>
            <Button variant="outline">Edit Event</Button>
          </Link>
          {!event.is_canceled && (
            <Link href={`/events/${event.id}/edit?action=cancel`} passHref>
              <Button variant="danger">Cancel Event</Button>
            </Link>
          )}
          <Link href="/events" passHref>
            <Button variant="secondary">Back to Events</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            {/* Left column - Event details */}
            <div className="flex-1 space-y-6">
              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                {event.is_canceled && (
                  <Badge variant="error">Canceled</Badge>
                )}
                {event.is_published ? (
                  <Badge variant="success">Published</Badge>
                ) : (
                  <Badge variant="warning">Draft</Badge>
                )}
                {event.category && (
                  <Badge
                    variant="default" 
                    className="flex items-center"
                  >
                    <span 
                      className="w-2 h-2 rounded-full mr-1" 
                      style={{ backgroundColor: event.category.color }}
                    />
                    {event.category.name}
                  </Badge>
                )}
              </div>
              
              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <div className="prose max-w-none">
                  {event.description ? (
                    <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
                  ) : (
                    <p className="text-gray-500 italic">No description provided</p>
                  )}
                </div>
              </div>
              
              {/* Location */}
              {event.location && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Location</h3>
                  <p className="text-gray-700">{event.location}</p>
                </div>
              )}
            </div>
            
            {/* Right column - Event metadata */}
            <div className="md:w-72 bg-gray-50 p-4 rounded-lg space-y-4">
              {/* Date and time */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h3>
                <p className="text-gray-900 font-medium">
                  {formatDateTime(event.date, event.start_time)}
                </p>
                {event.end_time && (
                  <p className="text-gray-500 text-sm">
                    Ends at {formatDateTime(event.date, event.end_time)}
                  </p>
                )}
              </div>
              
              {/* Duration */}
              {event.duration && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Duration</h3>
                  <p className="text-gray-900">{formatDuration(event.duration)}</p>
                </div>
              )}
              
              {/* Price */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Price</h3>
                <p className="text-gray-900">
                  {event.price ? `£${event.price.toFixed(2)}` : 'Free'}
                </p>
              </div>
              
              {/* Capacity */}
              {event.capacity && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Capacity</h3>
                  <p className="text-gray-900">{event.capacity} attendees</p>
                </div>
              )}
              
              {/* Created/Updated info */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-gray-500 text-xs">
                  Created: {new Date(event.created_at).toLocaleDateString('en-GB')}
                </p>
                <p className="text-gray-500 text-xs">
                  Last updated: {new Date(event.updated_at).toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Book section */}
      <QuickBookWrapper eventId={event.id} />

      {/* Bookings section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Bookings</h2>
        <BookingListWrapper eventId={event.id} />
      </div>
    </div>
  );
} 