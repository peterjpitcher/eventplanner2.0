'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerForm } from '@/components/customers/customer-form';
import { CustomerFormData } from '@/types';
import { createCustomer } from '@/utils/customer-service';

export default function NewCustomerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createCustomer(data);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Redirect to the customer list
      router.push('/customers');
      router.refresh();
    } catch (err: any) {
      console.error('Error creating customer:', err);
      setError(err.message || 'Failed to create customer. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            New Customer
          </h2>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg p-6">
        <CustomerForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
} 