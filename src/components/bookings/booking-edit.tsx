'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Booking, BookingFormData, bookingService } from '@/services/booking-service';
import { BookingForm } from './booking-form';

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
      setIsLoading(true);
      
      const { data, error } = await bookingService.getBookingById(bookingId);
      
      if (error) {
        console.error('Error fetching booking:', error);
        setError('Failed to load booking. Please try again.');
      } else {
        setBooking(data);
        setError(null);
      }
      
      setIsLoading(false);
    };

    fetchBooking();
  }, [bookingId]);

  const handleSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await bookingService.updateBooking(bookingId, data);
      
      if (response.error) {
        console.error('Error updating booking:', response.error);
        setError('Failed to update booking. Please try again.');
      } else {
        // Redirect back to event details page
        router.push(`/events/${eventId}`);
      }
    } catch (err) {
      console.error('Unexpected error updating booking:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading booking details...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!booking) {
    return <div className="text-red-500 p-4">Booking not found</div>;
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
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <BookingForm
            booking={booking}
            eventId={eventId}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
} 