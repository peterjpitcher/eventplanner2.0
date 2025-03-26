'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { EventDetails } from '@/components/events/event-details';
import { eventService } from '@/services/event-service';
import { AppLayout } from '@/components/layout/app-layout';

interface EventPageProps {
  params: {
    id: string;
  };
}

export default function EventPage({ params }: EventPageProps) {
  const { id } = params;
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await eventService.getEventById(id);
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error('Event not found');
        }
        
        setEvent(data);
      } catch (err) {
        console.error('Error loading event:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading event details...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !event) {
    return (
      <AppLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error ? error.message : 'Event not found'}</span>
          <div className="mt-4">
            <button 
              onClick={() => router.push('/events')}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Back to Events
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="container py-6">
        <PageHeader
          title={event.title}
          description={event.description || 'View event details below'}
        />

        <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-8">
            <EventDetails event={event} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 