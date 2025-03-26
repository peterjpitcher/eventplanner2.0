'use client';

import React, { useState } from 'react';
import { Customer } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { customerService } from '@/services/customer-service';
import { toast } from 'sonner';

interface CustomerListProps {
  customers: Customer[];
  onCustomerDeleted?: () => void;
}

export function CustomerList({ customers: initialCustomers, onCustomerDeleted }: CustomerListProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Function to handle customer deletion
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      setIsDeleting(id);
      setDeleteError(null);
      
      // Find the customer to delete
      const customerToDelete = customers.find(c => c.id === id);
      const customerName = customerToDelete 
        ? `${customerToDelete.first_name} ${customerToDelete.last_name}`.trim() 
        : 'Customer';
      
      try {
        // Call the service to delete the customer (don't do optimistic UI update)
        const { error } = await customerService.deleteCustomer(id);
        
        if (error) {
          throw error;
        }
        
        // Delete was successful, now update the UI
        toast.success(`${customerName} has been deleted`);
        
        // Update the customer list to remove the deleted customer
        setCustomers(customers.filter(customer => customer.id !== id));
        
        // Notify parent component about the deletion
        if (onCustomerDeleted) {
          onCustomerDeleted();
        }
      } catch (error: any) {
        console.error('Error deleting customer:', error);
        
        // Show error message
        const errorMessage = error.message || 'Unknown error';
        setDeleteError(`Failed to delete customer: ${errorMessage}`);
        
        // Show toast with more specific message
        if (errorMessage.includes('existing bookings')) {
          toast.error(`Cannot delete ${customerName}: This customer has existing bookings. Please delete the bookings first.`);
        } else {
          toast.error(`Failed to delete ${customerName}: ${errorMessage}`);
        }
      } finally {
        setIsDeleting(null);
      }
    }
  };

  if (customers.length === 0) {
    return (
      <div className="text-center py-10">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No customers</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new customer.</p>
        <div className="mt-6">
          <Link
            href="/customers/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Customer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {deleteError}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setDeleteError(null)}
          >
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
        </div>
      )}
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mobile
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {customer.first_name} {customer.last_name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{customer.mobile_number}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500 truncate max-w-xs">{customer.notes}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex space-x-2 justify-end">
                  <Link
                    href={`/customers/${customer.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </Link>
                  <Link
                    href={`/customers/${customer.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    disabled={isDeleting === customer.id}
                    className={`text-red-600 hover:text-red-900 ${isDeleting === customer.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isDeleting === customer.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 