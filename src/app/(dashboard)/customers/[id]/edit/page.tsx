'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerForm } from '@/components/customers/customer-form';
import { Customer, CustomerFormData } from '@/types';
import { getCustomerById, updateCustomer } from '@/utils/customer-service';

interface EditCustomerPageProps {
  params: {
    id: string;
  };
}

export default function EditCustomerPage({ params }: EditCustomerPageProps) {
  const { id } = params;
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCustomer() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getCustomerById(id);
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        setCustomer(response.data);
      } catch (err: any) {
        console.error('Error loading customer:', err);
        setError(err.message || 'Failed to load customer details.');
      } finally {
        setIsLoading(false);
      }
    }

    loadCustomer();
  }, [id]);

  const handleSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await updateCustomer(id, data);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Redirect to the customer details
      router.push(`/customers/${id}`);
      router.refresh();
    } catch (err: any) {
      console.error('Error updating customer:', err);
      setError(err.message || 'Failed to update customer. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading customer details...</p>
      </div>
    );
  }

  if (error && !isSubmitting) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
        <div className="mt-4">
          <button 
            onClick={() => router.push('/customers')}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Notice:</strong>
        <span className="block sm:inline"> Customer not found.</span>
        <div className="mt-4">
          <button 
            onClick={() => router.push('/customers')}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Edit Customer: {customer.first_name} {customer.last_name}
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
        <CustomerForm customer={customer} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
} 