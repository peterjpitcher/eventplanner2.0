'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Booking, BookingFormData, bookingService } from '@/services/booking-service';
import { BookingForm } from './booking-form';
import { Spinner } from '../ui/spinner';
import { Alert } from '../ui/alert';
import { toast } from 'sonner';

interface BookingEditProps {
  bookingId: string;
  eventId: string;
}

export function BookingEdit({ bookingId, eventId }: BookingEditProps) {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await bookingService.getBookingById(bookingId);
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error('Booking not found');
        }
        
        setBooking(data);
      } catch (err: any) {
        console.error('Error fetching booking:', err);
        setError(err.message || 'Failed to load booking. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleSubmit = async (data: BookingFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validation
      if (!data.customer_id) {
        throw new Error('Please select a customer');
      }

      if (!data.event_id) {
        throw new Error('Event ID is required');
      }

      if (!data.seats_or_reminder || isNaN(Number(data.seats_or_reminder)) || Number(data.seats_or_reminder) <= 0) {
        throw new Error('Please enter a valid number of seats');
      }

      const response = await bookingService.updateBooking(bookingId, {
        ...data,
        event_id: data.event_id || eventId
      });
      
      if (response.error) {
        throw new Error(typeof response.error === 'string' ? response.error : 'Failed to update booking');
      }
      
      toast.success('Booking updated successfully');
      // Redirect back to event details page
      router.push(`/events/${eventId}`);
    } catch (err: any) {
      console.error('Error updating booking:', err);
      setError(err.message || 'Failed to update booking. Please try again.');
      toast.error(err.message || 'Failed to update booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner />
        <span className="ml-2 text-gray-500">Loading booking details...</span>
      </div>
    );
  }

  if (!booking && !isLoading && !error) {
    return (
      <Alert variant="error">
        Booking not found. The booking may have been deleted or you may not have permission to view it.
        <div className="mt-4">
          <button
            onClick={() => router.push(`/events/${eventId}`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Event
          </button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Booking</h1>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => router.push(`/events/${eventId}`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Event
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {error && (
            <div className="mb-4">
              <Alert variant="error">
                {error}
              </Alert>
            </div>
          )}
          
          {booking && (
            <BookingForm
              booking={booking}
              eventId={eventId}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
} 