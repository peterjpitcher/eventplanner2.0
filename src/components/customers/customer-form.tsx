'use client';

import React, { useState } from 'react';
import { Customer, CustomerFormData } from '@/types';
import { useRouter } from 'next/navigation';
import { customerService } from '@/services/customer-service';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function CustomerForm({ customer, onSubmit, isSubmitting }: CustomerFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CustomerFormData>({
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    mobile_number: customer?.mobile_number || '',
    notes: customer?.notes || '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = 'Mobile number is required';
    } else if (!customerService.isValidUKMobileNumber(formData.mobile_number)) {
      newErrors.mobile_number = 'Please enter a valid UK mobile number (e.g., 07123456789 or +447123456789)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
          First Name *
        </label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            errors.first_name ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={isSubmitting}
        />
        {errors.first_name && (
          <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
        )}
      </div>

      <div>
        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
          Last Name
        </label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700">
          Mobile Number *
        </label>
        <input
          type="tel"
          id="mobile_number"
          name="mobile_number"
          value={formData.mobile_number}
          onChange={handleChange}
          placeholder="07123456789 or +447123456789"
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            errors.mobile_number ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={isSubmitting}
        />
        {errors.mobile_number && (
          <p className="mt-1 text-sm text-red-600">{errors.mobile_number}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : customer ? 'Update Customer' : 'Create Customer'}
        </button>
      </div>
    </form>
  );
} 