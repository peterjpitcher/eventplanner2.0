'use client';

import React, { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { CustomerList } from '@/components/customers/customer-list';
import { CustomerSearch } from '@/components/customers/customer-search';
import { CustomerImport } from '@/components/customers/customer-import';
import { getCustomers, searchCustomers } from '@/utils/customer-service';
import { PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImport, setShowImport] = useState(false);

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
    refreshCustomers();
  };

  // Handle import completion
  const handleImportComplete = () => {
    refreshCustomers();
    setShowImport(false);
  };

  // Refresh customer list
  const refreshCustomers = () => {
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

  // Toggle import section visibility
  const toggleImport = () => {
    setShowImport(!showImport);
  };

  return (
    <AppLayout>
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
          
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link
              href="/customers/new"
              className="inline-flex items-center px-4 py-2 border border-transparent 
                text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 
                hover:bg-blue-700 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Customer
            </Link>
            
            <button
              type="button"
              onClick={toggleImport}
              className="hidden md:inline-flex items-center px-4 py-2 border border-gray-300 
                text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white 
                hover:bg-gray-50 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Import Customers
            </button>
          </div>
        </div>
        
        {showImport && <CustomerImport onImportComplete={handleImportComplete} />}
        
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
            
            {customers.length === 0 && (
              <div className="py-8 px-4 text-center">
                {searchQuery ? (
                  <p className="text-gray-500">No customers found matching your search.</p>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-4">No customers added yet.</p>
                    <div className="flex justify-center space-x-4">
                      <Link
                        href="/customers/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent 
                          text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 
                          hover:bg-blue-700 focus:outline-none focus:ring-2 
                          focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Your First Customer
                      </Link>
                      
                      <button
                        type="button"
                        onClick={toggleImport}
                        className="hidden md:inline-flex items-center px-4 py-2 border border-gray-300 
                          text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white 
                          hover:bg-gray-50 focus:outline-none focus:ring-2 
                          focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                        Import Customers
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
} 