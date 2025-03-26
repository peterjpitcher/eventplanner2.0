'use client';

import { useState, useEffect } from 'react';
import { Booking, bookingService } from '@/services/booking-service';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { Alert } from '../ui/alert';
import { format } from 'date-fns';

interface BookingListProps {
  eventId: string;
  onBookingChange?: () => void; // Callback for when bookings change
}

export function BookingList({ eventId, onBookingChange }: BookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Track which booking is being deleted
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [eventId]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await bookingService.getBookingsByEvent(eventId);
      
      if (error) {
        throw error;
      }
      
      setBookings(data || []);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      setIsDeleting(bookingId);
      const { error } = await bookingService.deleteBooking(bookingId);
      
      if (error) {
        throw error;
      }
      
      toast.success('Booking deleted successfully');
      fetchBookings(); // Refresh the list
      
      // Notify parent component if provided
      if (onBookingChange) {
        onBookingChange();
      }
    } catch (err: any) {
      console.error('Error deleting booking:', err);
      toast.error(err.message || 'Failed to delete booking. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner />
        <span className="ml-2 text-gray-500">Loading bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        {error}
        <div className="mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchBookings}
          >
            Try Again
          </Button>
        </div>
      </Alert>
    );
  }

  if (!bookings.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No bookings found for this event.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mobile Number
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Seats
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Booked On
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {booking.customer?.first_name} {booking.customer?.last_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {booking.customer?.mobile_number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {booking.seats_or_reminder}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {booking.notes || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(booking.created_at), 'dd/MM/yyyy HH:mm')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <Link href={`/events/${eventId}/bookings/${booking.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
                <Link href={`/events/${eventId}/bookings/${booking.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(booking.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={isDeleting === booking.id}
                >
                  {isDeleting === booking.id ? (
                    <>
                      <Spinner size="sm" />
                      <span className="ml-1">Deleting...</span>
                    </>
                  ) : (
                    'Delete'
                  )}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 