'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Event } from '@/types/event';
import { supabase } from '@/lib/supabase';

export default function EventPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEvent = useCallback(async () => {
    try {
      setLoading(true);
      const { data: event, error } = await supabase
        .from('events')
        .select(`
          *,
          category:categories (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setEvent(event);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  if (loading) {
    return (
      <div className="container py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-6 bg-gray-200 rounded w-1/6 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-6">
        <PageHeader
          title="Event Not Found"
          description="The event you're looking for doesn't exist."
        />
        <Link href="/events" passHref>
          <Button>Back to Events</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-start mb-6">
        <PageHeader
          title={event.name}
          description={`Event details for ${event.name}`}
        />
        <div className="flex gap-4">
          {!event.is_canceled && (
            <Link href={`/events/${event.id}/edit?action=cancel`} passHref>
              <Button variant="danger">Cancel Event</Button>
            </Link>
          )}
          <Link href="/events" passHref>
            <Button variant="outline">Back to Events</Button>
          </Link>
          <Link href={`/events/${event.id}/edit`} passHref>
            <Button>Edit Event</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Basic Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="text-gray-900">{event.category?.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="text-gray-900">{event.date}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Time</dt>
                  <dd className="text-gray-900">{event.time}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Capacity</dt>
                  <dd className="text-gray-900">{event.capacity} people</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Price</dt>
                  <dd className="text-gray-900">£{event.price}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className={`text-${event.is_canceled ? 'red' : 'green'}-600`}>
                    {event.is_canceled ? 'Cancelled' : 'Active'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{event.description}</p>
            </div>
            
            {/* Location */}
            {event.location && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Location</h3>
                <p className="text-gray-700">{event.location}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 