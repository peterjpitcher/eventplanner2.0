'use client';

import React, { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { CustomerList } from '@/components/customers/customer-list';
import { CustomerSearch } from '@/components/customers/customer-search';
import { getCustomers, searchCustomers } from '@/utils/customer-service';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load customers on mount and when searchQuery changes
  useEffect(() => {
    async function loadCustomers() {
      setIsLoading(true);
      setError(null);

      try {
        let response;
        
        if (searchQuery) {
          response = await searchCustomers(searchQuery);
        } else {
          response = await getCustomers();
        }

        if (response.error) {
          throw new Error(response.error.message);
        }

        setCustomers(response.data || []);
      } catch (err) {
        console.error('Error loading customers:', err);
        setError('Failed to load customers. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    loadCustomers();
  }, [searchQuery]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle customer deletion
  const handleCustomerDeleted = () => {
    // Refresh the customer list
    if (searchQuery) {
      searchCustomers(searchQuery).then((response) => {
        if (!response.error) {
          setCustomers(response.data || []);
        }
      });
    } else {
      getCustomers().then((response) => {
        if (!response.error) {
          setCustomers(response.data || []);
        }
      });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Customers</h1>
      
      <div className="mb-6">
        <CustomerSearch onSearch={handleSearch} />
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading customers...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <CustomerList customers={customers} onCustomerDeleted={handleCustomerDeleted} />
        </div>
      )}
    </div>
  );
} 