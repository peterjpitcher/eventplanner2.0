import { BookingEdit } from '@/components/bookings/booking-edit';
import { bookingService } from '@/services/booking-service';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { id: string, bookingId: string } }) {
  const { data: booking } = await bookingService.getBookingById(params.bookingId);
  
  if (!booking) {
    return {
      title: 'Booking Not Found | Event Planner',
      description: 'The requested booking could not be found',
    };
  }
  
  return {
    title: `Edit Booking | Event Planner`,
    description: 'Edit a booking for an event',
  };
}

export default function BookingEditPage({ params }: { params: { id: string, bookingId: string } }) {
  return (
    <BookingEdit bookingId={params.bookingId} eventId={params.id} />
  );
} 