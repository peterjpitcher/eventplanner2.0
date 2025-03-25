'use client';

import { useState, useEffect } from 'react';
import { Booking, bookingService } from '@/services/booking-service';
import { Customer } from '@/types';
import Link from 'next/link';

interface BookingListProps {
  eventId: string;
}

export function BookingList({ eventId }: BookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      const { data, error } = await bookingService.getBookingsByEvent(eventId);
      
      if (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load bookings. Please try again.');
      } else {
        setBookings(data || []);
        setError(null);
      }
      
      setIsLoading(false);
    };

    fetchBookings();
  }, [eventId]);

  const handleDeleteBooking = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      const { error } = await bookingService.deleteBooking(id);
      
      if (error) {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking. Please try again.');
      } else {
        // Remove the deleted booking from state
        setBookings(bookings.filter(booking => booking.id !== id));
      }
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading bookings...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-md">
        <p className="text-gray-500">No bookings yet for this event.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">Bookings ({bookings.length})</h3>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {bookings.map((booking) => (
            <li key={booking.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h4 className="text-md font-medium text-indigo-600">
                    {booking.customer?.first_name} {booking.customer?.last_name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {booking.customer?.mobile_number}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium">Seats/Reminder:</span> {booking.seats_or_reminder}
                  </p>
                  {booking.notes && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Notes:</span> {booking.notes}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/events/${eventId}/bookings/${booking.id}/edit`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-red-700 bg-white hover:text-red-500 focus:outline-none focus:border-red-300 focus:shadow-outline-red active:text-red-800 active:bg-gray-50 transition ease-in-out duration-150"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 