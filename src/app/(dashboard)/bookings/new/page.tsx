'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookingForm } from '@/components/bookings/booking-form';
import { bookingService } from '@/services/booking-service';
import { toast } from 'sonner';

export default function NewBookingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const { data, error, smsSent } = await bookingService.createBooking(formData);
      
      if (error) {
        throw error;
      }
      
      toast.success('Booking created successfully' + (smsSent ? ' and SMS sent' : ''));
      router.push('/bookings');
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
  );
} 