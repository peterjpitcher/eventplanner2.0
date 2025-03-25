'use client';

import { SMSMessageList } from '@/components/sms/sms-message-list';

interface SMSMessageListWrapperProps {
  bookingId: string;
}

export function SMSMessageListWrapper({ bookingId }: SMSMessageListWrapperProps) {
  return <SMSMessageList bookingId={bookingId} />;
} 