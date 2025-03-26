'use client';

import React, { useState, useEffect } from 'react';
import { Booking, bookingService } from '@/services/booking-service';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/app-layout';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await bookingService.getBookings();
      
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
      setDeletingBooking(bookingId);
      const { error } = await bookingService.deleteBooking(bookingId);
      
      if (error) {
        throw error;
      }
      
      toast.success('Booking deleted successfully');
      fetchBookings(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting booking:', err);
      toast.error(err.message || 'Failed to delete booking. Please try again.');
    } finally {
      setDeletingBooking(null);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-8">
          <Spinner />
          <span className="ml-2 text-gray-500">Loading bookings...</span>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <Alert variant="error">
          {error}
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={fetchBookings}>
              Try Again
            </Button>
          </div>
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
          <Link href="/bookings/new">
            <Button>
              Create New Booking
            </Button>
          </Link>
        </div>
        
        {!bookings.length ? (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="text-center py-10">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new booking.</p>
              <div className="mt-6">
                <Link href="/bookings/new">
                  <Button>
                    Create New Booking
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seats
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
                        {booking.event?.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.seats_or_reminder}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(booking.created_at), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link href={`/events/${booking.event_id}/bookings/${booking.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link href={`/events/${booking.event_id}/bookings/${booking.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(booking.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deletingBooking === booking.id}
                        >
                          {deletingBooking === booking.id ? (
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
          </div>
        )}
      </div>
    </AppLayout>
  );
} 