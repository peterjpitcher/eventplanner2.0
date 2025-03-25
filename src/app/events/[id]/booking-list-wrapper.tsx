'use client';

import { BookingList } from '@/components/bookings/booking-list';

interface BookingListWrapperProps {
  eventId: string;
}

export function BookingListWrapper({ eventId }: BookingListWrapperProps) {
  return <BookingList eventId={eventId} />;
} 