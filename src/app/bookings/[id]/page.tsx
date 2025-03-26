'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { bookingService } from '@/services/booking-service';
import { BookingDetail } from '@/components/bookings/booking-detail';
import { PageHeader } from '@/components/ui/page-header';
import { smsService } from '@/services/sms-service';
import { AppLayout } from '@/components/layout/app-layout';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';

export default function BookingPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [smsMessages, setSmsMessages] = useState<any[]>([]);
  const [eventName, setEventName] = useState('Unknown Event');
  const [customerName, setCustomerName] = useState('Unknown Customer');

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        if (!id) {
          throw new Error('No booking ID provided');
        }
        
        setIsLoading(true);
        
        // Fetch booking data
        const { data: bookingData, error: bookingError } = await bookingService.getBookingById(id);
        
        if (bookingError) {
          throw bookingError;
        }
        
        if (!bookingData) {
          throw new Error('Booking not found');
        }
        
        setBooking(bookingData);
        
        // Get related info
        setEventName(bookingData.event?.title || 'Unknown Event');
        setCustomerName(bookingData.customer 
          ? `${bookingData.customer.first_name}${bookingData.customer.last_name ? ' ' + bookingData.customer.last_name : ''}` 
          : 'Unknown Customer');
        
        // Get SMS messages
        const { data: messages } = await smsService.getSMSMessagesByBookingId(id);
        setSmsMessages(messages || []);
        
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookingData();
  }, [id]);

  return (
    <AppLayout>
      <div className="py-6">
        <PageHeader
          title="Booking Details"
          description="View and manage booking information"
        />
        
        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner />
              <span className="ml-3">Loading booking...</span>
            </div>
          ) : error ? (
            <Alert variant="error" className="mb-6">
              <p className="font-semibold">Error loading booking</p>
              <p className="text-sm mt-1">{error.message}</p>
            </Alert>
          ) : booking ? (
            <BookingDetail 
              booking={booking} 
              eventName={eventName} 
              customerName={customerName}
              smsMessages={smsMessages}
            />
          ) : (
            <Alert variant="error">Booking not found</Alert>
          )}
        </div>
      </div>
    </AppLayout>
  );
} 