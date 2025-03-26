'use client';

import { useState, useEffect } from 'react';
import { SMSMessage, smsService } from '@/services/sms-service';
import { SMSStatusIndicator } from './sms-status-indicator';

interface SMSMessageListProps {
  bookingId: string;
}

export function SMSMessageList({ bookingId }: SMSMessageListProps) {
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await smsService.getSMSMessagesByBookingId(bookingId);
        
        if (error) {
          console.error('Error fetching SMS messages:', error);
          setError('Failed to load SMS messages');
        } else {
          setMessages(data || []);
          setError(null);
        }
      } catch (err) {
        console.error('Unexpected error fetching SMS messages:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [bookingId]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading SMS history...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (messages.length === 0) {
    return <div className="p-4 text-gray-500 italic">No SMS messages for this booking</div>;
  }

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">SMS History</h3>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {messages.map((message) => (
            <li key={message.id} className="px-4 py-4">
              <div className="flex justify-between">
                <div className="flex-1 max-w-lg">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-900">
                      {message.message_type.replace(/_/g, ' ')}
                    </p>
                    <span className="mx-2">•</span>
                    <SMSStatusIndicator status={message.status} />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 whitespace-pre-line">
                    {message.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <p className="text-xs text-gray-500">{formatDate(message.sent_at)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 