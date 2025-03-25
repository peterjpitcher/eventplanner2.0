'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CustomerSearchProps {
  onSearch: (query: string) => void;
}

export function CustomerSearch({ onSearch }: CustomerSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleAddCustomer = () => {
    router.push('/customers/new');
  };

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center w-full">
      <form onSubmit={handleSearch} className="flex w-full sm:w-3/4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search customers by name or mobile number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              onSearch('');
            }}
            className={`absolute inset-y-0 right-0 px-3 flex items-center ${
              searchQuery ? 'text-gray-500 hover:text-gray-700' : 'text-transparent'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
        >
          Search
        </button>
      </form>
      <button
        type="button"
        onClick={handleAddCustomer}
        className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md sm:w-1/4"
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
      </button>
    </div>
  );
} 