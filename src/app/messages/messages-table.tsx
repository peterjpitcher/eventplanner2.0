'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { smsService, SMSReply } from '@/services/sms-service';
import { toast } from 'sonner';

export function MessagesTable() {
  const [messages, setMessages] = useState<SMSReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages on load
  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      try {
        const { data, error } = await smsService.getReplies();
        if (error) {
          throw new Error(error.message);
        }
        setMessages(data || []);
      } catch (err: any) {
        setError(err.message);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, []);

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

  // Mark all messages as read
  const handleMarkAllAsRead = async () => {
    try {
      const { success, error } = await smsService.markAllRepliesAsRead();
      
      if (!success) {
        throw new Error(error.message);
      }
      
      // Update local state
      setMessages(prevMessages => 
        prevMessages.map(msg => ({ ...msg, read: true }))
      );
      
      toast.success('All messages marked as read');
    } catch (err: any) {
      toast.error('Failed to mark messages as read');
    }
  };

  // Calculate unread message count
  const unreadCount = messages.filter(msg => !msg.read).length;

  if (loading) {
    return <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-600 p-4">Error: {error}</div>;
  }

  if (messages.length === 0) {
    return <div className="text-center p-8 text-gray-500">No SMS replies received yet.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          {unreadCount > 0 ? (
            <span className="text-sm font-medium text-blue-600">{unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}</span>
          ) : (
            <span className="text-sm text-gray-500">All messages read</span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Received
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {messages.map((message) => (
              <tr 
                key={message.id} 
                className={message.read ? 'bg-white' : 'bg-blue-50'}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {message.read ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Read
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Unread
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {message.customer?.first_name} {message.customer?.last_name}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {message.from_number}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-md break-words">
                    {message.message_content}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDistanceToNow(new Date(message.received_at), { addSuffix: true })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    {!message.read && (
                      <button
                        onClick={() => handleMarkAsRead(message.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Mark as Read
                      </button>
                    )}
                    <Link
                      href={`/customers/${message.customer_id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Customer
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 