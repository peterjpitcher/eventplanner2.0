'use client';

import { QuickBook } from '@/components/bookings/quick-book';
import { useRouter } from 'next/navigation';

interface QuickBookWrapperProps {
  eventId: string;
}

export function QuickBookWrapper({ eventId }: QuickBookWrapperProps) {
  const router = useRouter();
  
  const handleSuccess = () => {
    // Refresh the page to show the new booking
    router.refresh();
  };

  return <QuickBook eventId={eventId} onSuccess={handleSuccess} />;
} 