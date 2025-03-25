'use client';

import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { smsService, SMSReply } from '@/services/sms-service';
import { toast } from 'sonner';

interface CustomerMessagesProps {
  customerId: string;
}

export function CustomerMessages({ customerId }: CustomerMessagesProps) {
  const [messages, setMessages] = useState<SMSReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      try {
        const { data, error } = await smsService.getRepliesByCustomer(customerId);
        if (error) {
          throw new Error(error.message);
        }
        setMessages(data || []);
      } catch (err: any) {
        setError(err.message);
        toast.error('Failed to load customer messages');
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [customerId]);

  // Mark a message as read
  const handleMarkAsRead = async (id: string) => {
    try {
      const { success, error } = await smsService.markReplyAsRead(id);
      
      if (!success) {
        throw new Error(error.message);
      }
      
      // Update local state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === id ? { ...msg, read: true } : msg
        )
      );
      
      toast.success('Message marked as read');
    } catch (err: any) {
      toast.error('Failed to mark message as read');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 p-4">Error loading messages: {error}</div>;
  }

  if (messages.length === 0) {
    return <div className="text-center p-4 text-gray-500">No SMS replies from this customer.</div>;
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">SMS Messages</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Recent SMS replies from this customer.
        </p>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {messages.map((message) => (
            <li 
              key={message.id}
              className={`px-4 py-4 ${message.read ? '' : 'bg-blue-50'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`h-2 w-2 rounded-full ${message.read ? 'bg-gray-300' : 'bg-blue-500'}`}></span>
                  <p className="ml-2 text-sm text-gray-500">
                    {formatDistanceToNow(new Date(message.received_at), { addSuffix: true })}
                  </p>
                </div>
                {!message.read && (
                  <button
                    onClick={() => handleMarkAsRead(message.id)}
                    className="text-xs text-blue-600 hover:text-blue-900"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-900">{message.message_content}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 