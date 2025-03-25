import { bookingService } from '@/services/booking-service';
import { BookingDetail } from '@/components/bookings/booking-detail';
import { redirect } from 'next/navigation';
import { Heading } from '@/components/ui/heading';
import { smsService } from '@/services/sms-service';

interface BookingPageProps {
  params: {
    id: string;
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { id } = params;

  const { data: booking, error } = await bookingService.getBookingById(id);

  if (error || !booking) {
    redirect('/bookings');
  }

  // Get the SMS messages for this booking
  const { data: smsMessages } = await smsService.getMessagesByBooking(id);

  // Get the event name and customer name
  const eventName = booking.event?.title || 'Unknown Event';
  const customerName = booking.customer ? 
    `${booking.customer.first_name}${booking.customer.last_name ? ' ' + booking.customer.last_name : ''}` : 
    'Unknown Customer';

  return (
    <div className="container mx-auto px-4 py-6">
      <Heading title="Booking Details" description="View and manage booking information" />
      
      <div className="mt-6">
        <BookingDetail 
          booking={booking} 
          eventName={eventName} 
          customerName={customerName}
          smsMessages={smsMessages || []}
        />
      </div>
    </div>
  );
} 