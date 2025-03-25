import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { bookingService } from '@/services/booking-service';
import { customerService } from '@/services/customer-service';
import { eventService } from '@/services/event-service';
import { formatDateTime } from '@/lib/date-utils';
import { SMSMessageListWrapper } from './sms-message-list-wrapper';
import { SendSMSFormWrapper } from './send-sms-form-wrapper';

export async function generateMetadata({ params }: { params: { id: string, bookingId: string } }) {
  const { data: booking } = await bookingService.getBookingById(params.bookingId);
  
  if (!booking) {
    return {
      title: 'Booking Not Found | Event Planner',
      description: 'The requested booking could not be found',
    };
  }
  
  return {
    title: `Booking Details | Event Planner`,
    description: 'View booking details and SMS history',
  };
}

export default async function BookingDetailsPage({ params }: { params: { id: string, bookingId: string } }) {
  // Fetch the booking, with fallbacks for customer and event if join data is missing
  const { data: booking, error } = await bookingService.getBookingById(params.bookingId);
  
  if (error || !booking) {
    console.error('Error loading booking:', error);
    notFound();
  }

  // Ensure we have full customer and event data
  const customer = booking.customer || 
    (await customerService.getCustomerById(booking.customer_id)).data;
    
  const event = booking.event || 
    (await eventService.getEventById(booking.event_id)).data;

  if (!customer || !event) {
    console.error('Missing required customer or event data');
    notFound();
  }

  // Format the event date and time
  const eventDateTime = formatDateTime(event.date, event.start_time);

  return (
    <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Booking Details
          </h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link href={`/events/${params.id}/bookings/${params.bookingId}/edit`}>
            <button
              type="button"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Booking
            </button>
          </Link>
          <Link href={`/events/${params.id}`}>
            <button
              type="button"
              className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Event
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {event.title}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {eventDateTime}
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Customer
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {customer.first_name} {customer.last_name}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Contact Number
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {customer.mobile_number}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Booking Type
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {booking.seats_or_reminder}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Created
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(booking.created_at).toLocaleDateString('en-GB')}
              </dd>
            </div>
            {booking.notes && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Notes
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {booking.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* SMS History */}
      <div className="mt-8">
        <SMSMessageListWrapper bookingId={params.bookingId} />
      </div>

      {/* Send SMS Form */}
      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Send SMS Message
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Send a personalized SMS message to this customer.</p>
          </div>
          <div className="mt-5">
            <SendSMSFormWrapper 
              customerId={customer.id} 
              bookingId={params.bookingId} 
            />
          </div>
        </div>
      </div>
    </div>
  );
} 