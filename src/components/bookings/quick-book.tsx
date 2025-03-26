'use client';

import { useState } from 'react';
import { BookingForm } from './booking-form';
import { BookingFormData, bookingService } from '@/services/booking-service';
import { toast } from 'sonner';

interface QuickBookProps {
  eventId: string;
  onSuccess?: () => void;
}

export function QuickBook({ eventId, onSuccess }: QuickBookProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [smsStatus, setSmsStatus] = useState<'sent' | 'failed' | null>(null);

  const handleSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setError(null);
    setBookingSuccess(false);
    setSmsStatus(null);

    try {
      if (!data.customer_id) {
        throw new Error('Please select a customer');
      }
      
      if (!data.event_id) {
        throw new Error('Event ID is missing');
      }
      
      if (!data.seats_or_reminder) {
        throw new Error('Please enter a valid number of seats');
      }
      
      const seatsValue = typeof data.seats_or_reminder === 'string' 
        ? parseInt(data.seats_or_reminder, 10) 
        : data.seats_or_reminder;
        
      if (isNaN(seatsValue) || seatsValue <= 0) {
        throw new Error('Please enter a valid number of seats');
      }

      const response = await bookingService.createBooking({
        ...data,
        event_id: eventId
      });
      
      if (response.error) {
        throw response.error;
      }
      
      setBookingSuccess(true);
      setSmsStatus(response.smsSent ? 'sent' : 'failed');
      toast.success('Booking created successfully');
      
      setTimeout(() => {
        setShowForm(false);
        setBookingSuccess(false);
        setSmsStatus(null);
        
        if (onSuccess) {
          onSuccess();
        }
      }, 3000);
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      toast.error(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Book</h3>
        
        {!showForm ? (
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Add a customer to this event with just a few clicks.</p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Booking
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            {bookingSuccess && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md">
                <p>Booking created successfully!</p>
                {smsStatus === 'sent' && (
                  <p className="text-sm mt-1">Confirmation SMS sent to customer.</p>
                )}
                {smsStatus === 'failed' && (
                  <p className="text-sm mt-1 text-yellow-600">Note: Confirmation SMS could not be sent.</p>
                )}
              </div>
            )}
            
            <BookingForm
              eventId={eventId}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              error={error}
            />
            
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                  setBookingSuccess(false);
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 