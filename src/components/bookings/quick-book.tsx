'use client';

import { useState } from 'react';
import { BookingForm } from './booking-form';
import { BookingFormData, bookingService } from '@/services/booking-service';
import { SMSStatus } from './sms-status';
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
  const [smsStatus, setSmsStatus] = useState<'sent' | 'failed' | 'pending' | null>(null);

  const handleSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setError(null);
    setBookingSuccess(false);
    setSmsStatus('pending');

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
      
      // Different toast messages based on SMS status
      if (data.send_notification) {
        if (response.smsSent) {
          toast.success('Booking created successfully and SMS confirmation sent');
        } else {
          toast.success('Booking created successfully but SMS could not be sent');
        }
      } else {
        toast.success('Booking created successfully (SMS notification disabled)');
      }
      
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
      setSmsStatus(null);
      toast.error(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 border border-gray-200 rounded-lg bg-white p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Quick Book</h3>
        {!showForm && !bookingSuccess && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Booking
          </button>
        )}
      </div>

      {bookingSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-green-700">
                Booking created successfully
              </p>
              <div className="mt-1 md:mt-0">
                <SMSStatus status={smsStatus} />
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && !bookingSuccess && (
        <BookingForm
          eventId={eventId}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
    </div>
  );
} 