'use client';

import { useState, useEffect, useRef } from 'react';
import { Booking, bookingService } from '@/services/booking-service';
import { Customer } from '@/types';
import Link from 'next/link';
import { toast } from 'sonner';

interface BookingListProps {
  eventId: string;
}

export function BookingList({ eventId }: BookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [sendSMS, setSendSMS] = useState(true);
  const dialogRef = useRef<HTMLDivElement>(null);

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

  const openDeleteConfirm = (id: string) => {
    setBookingToDelete(id);
    setShowConfirmDialog(true);
    setSendSMS(true);
  };

  const closeDeleteConfirm = () => {
    setShowConfirmDialog(false);
    setBookingToDelete(null);
  };

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    
    try {
      setIsDeleting(true);
      const { error, smsSent } = await bookingService.deleteBooking(bookingToDelete, sendSMS);
      
      if (error) {
        console.error('Error deleting booking:', error);
        toast.error('Failed to delete booking. Please try again.');
      } else {
        // Remove the deleted booking from state
        setBookings(bookings.filter(booking => booking.id !== bookingToDelete));
        
        if (sendSMS) {
          if (smsSent) {
            toast.success('Booking deleted and cancellation SMS sent');
          } else {
            toast.success('Booking deleted but SMS could not be sent');
          }
        } else {
          toast.success('Booking deleted successfully');
        }
      }
    } catch (err) {
      console.error('Unexpected error deleting booking:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
      closeDeleteConfirm();
    }
  };

  // Close dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        closeDeleteConfirm();
      }
    };

    if (showConfirmDialog) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showConfirmDialog]);

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
                    href={`/events/${eventId}/bookings/${booking.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                  >
                    View
                  </Link>
                  <Link
                    href={`/events/${eventId}/bookings/${booking.id}/edit`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => openDeleteConfirm(booking.id)}
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

      {/* Delete Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div ref={dialogRef} className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Booking Cancellation</h3>
            <p className="mb-6">Are you sure you want to cancel this booking?</p>
            
            <div className="mb-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={sendSMS}
                  onChange={(e) => setSendSMS(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span>Send cancellation SMS to customer</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteConfirm}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBooking}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 