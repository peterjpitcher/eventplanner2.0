'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { EventDetails } from '@/components/events/event-details';
import { BookingList } from '@/components/bookings/booking-list';
import { QuickBook } from '@/components/bookings/quick-book';
import { eventService } from '@/services/event-service';
import { AppLayout } from '@/components/layout/app-layout';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

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
  const [refreshBookings, setRefreshBookings] = useState(0);

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

  // Handler for when a booking is added or changed
  const handleBookingChange = () => {
    setRefreshBookings(prev => prev + 1); // Increment to trigger a refresh
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="text-center py-10">
          <div className="flex justify-center">
            <Spinner size="lg" />
          </div>
          <p className="mt-2 text-gray-500">Loading event details...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !event) {
    return (
      <AppLayout>
        <Alert variant="error">
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
        </Alert>
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
            <EventDetails 
              event={event} 
              onEventUpdated={() => {
                // Refetch the event to show the cancelled status
                const refreshEvent = async () => {
                  try {
                    const { data } = await eventService.getEventById(id);
                    if (data) {
                      setEvent(data);
                    }
                  } catch (err) {
                    console.error('Error refreshing event:', err);
                  }
                };
                refreshEvent();
                // Also refresh bookings
                handleBookingChange();
              }} 
            />
          </div>
        </div>
        
        {/* Bookings Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Event Bookings</h2>
          
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
            <div className="px-6 py-8">
              <BookingList 
                eventId={id} 
                onBookingChange={handleBookingChange}
                key={refreshBookings} // Force re-render when refreshBookings changes
              />
            </div>
          </div>
          
          {/* Quick Book Form */}
          <QuickBook 
            eventId={id} 
            onSuccess={handleBookingChange}
          />
        </div>
      </div>
    </AppLayout>
  );
} 