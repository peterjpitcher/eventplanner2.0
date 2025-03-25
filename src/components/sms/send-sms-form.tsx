'use client';

import { useState } from 'react';
import { Customer } from '@/types';
import { smsService } from '@/services/sms-service';

interface SendSMSFormProps {
  customer: Customer;
  bookingId?: string;
  onSuccess?: () => void;
}

export function SendSMSForm({ customer, bookingId, onSuccess }: SendSMSFormProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await smsService.sendSMSToCustomer({
        customer,
        messageType: 'manual',
        messageContent: message,
        bookingId: bookingId || null
      });

      if (!result.success) {
        setError('Failed to send SMS. Please try again.');
        console.error('Error sending SMS:', result.error);
      } else {
        setSuccess(true);
        setMessage('');
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Unexpected error sending SMS:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Message to {customer.first_name} {customer.last_name}
        </label>
        <div className="mt-1">
          <textarea
            id="message"
            name="message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder={`Hi ${customer.first_name}, `}
            disabled={isSubmitting}
          ></textarea>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {160 - message.length} characters remaining
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {success && (
        <div className="text-sm text-green-600">
          Message sent successfully.
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || message.length === 0}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </form>
  );
} 