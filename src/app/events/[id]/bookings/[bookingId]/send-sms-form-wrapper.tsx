'use client';

import { useState, useEffect } from 'react';
import { SendSMSForm } from '@/components/sms/send-sms-form';
import { Customer } from '@/types';
import { customerService } from '@/services/customer-service';
import { useRouter } from 'next/navigation';

interface SendSMSFormWrapperProps {
  customerId: string;
  bookingId: string;
}

export function SendSMSFormWrapper({ customerId, bookingId }: SendSMSFormWrapperProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const { data, error } = await customerService.getCustomerById(customerId);
        
        if (error) {
          console.error('Error fetching customer:', error);
          setError('Failed to load customer details');
        } else {
          setCustomer(data);
          setError(null);
        }
      } catch (err) {
        console.error('Unexpected error fetching customer:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  const handleSuccess = () => {
    // Refresh the page to show the updated SMS history
    router.refresh();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !customer) {
    return <div className="text-red-500">{error || 'Customer not found'}</div>;
  }

  return (
    <SendSMSForm 
      customer={customer} 
      bookingId={bookingId}
      onSuccess={handleSuccess}
    />
  );
} 