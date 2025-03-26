'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookingForm } from '@/components/bookings/booking-form';
import { BookingFormData, bookingService } from '@/services/booking-service';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/app-layout';

export default function NewBookingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: BookingFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate form data
      if (!formData.customer_id) {
        throw new Error('Please select a customer');
      }
      
      if (!formData.event_id) {
        throw new Error('Please select an event');
      }
      
      // Check if seats_or_reminder is valid
      if (!formData.seats_or_reminder) {
        throw new Error('Please enter a valid number of seats');
      }
      
      // Convert to number and validate
      const seatsValue = typeof formData.seats_or_reminder === 'string' 
        ? parseInt(formData.seats_or_reminder, 10) 
        : formData.seats_or_reminder;
        
      if (isNaN(seatsValue) || seatsValue <= 0) {
        throw new Error('Please enter a valid number of seats');
      }
      
      // Create booking
      const { data, error, smsSent } = await bookingService.createBooking(formData);
      
      if (error) {
        throw error;
      }
      
      // Show success message
      const smsMessage = smsSent ? ' and SMS confirmation sent' : '';
      toast.success(`Booking created successfully${smsMessage}`);
      
      // Redirect to bookings page
      router.push('/bookings');
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Failed to create booking. Please try again.');
      toast.error(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create New Booking</h1>
          <BookingForm 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={error}
            eventId=""
          />
        </div>
      </div>
    </AppLayout>
  );
} 