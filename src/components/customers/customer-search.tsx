'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/solid';

interface CustomerSearchProps {
  onSearch: (query: string) => void;
}

export function CustomerSearch({ onSearch }: CustomerSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'name' | 'mobile'>('all');
  const router = useRouter();

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    handleSearch();
  }, []);

  // Handle search form submission
  const handleSearch = useCallback(() => {
    let searchTerm = debouncedQuery;
    
    // If specific search type is selected, format the query for server-side filtering
    if (searchType !== 'all' && searchTerm) {
      searchTerm = `${searchType}:${searchTerm}`;
    }
    
    onSearch(searchTerm);
  }, [debouncedQuery, searchType, onSearch]);

  // Clear the search
  const handleClear = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchType('all');
    onSearch('');
  };

  // Handle adding a new customer
  const handleAddCustomer = () => {
    router.push('/customers/new');
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:space-x-4 sm:items-center w-full">
        <div className="relative flex-grow">
          <div className="relative flex w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              aria-label="Search customers"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                aria-label="Clear search"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <button
            type="button"
            onClick={toggleFilters}
            className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium 
              ${showFilters 
                ? 'bg-blue-100 text-blue-700 border-blue-300' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            aria-pressed={showFilters}
            aria-expanded={showFilters}
          >
            <FunnelIcon className="h-4 w-4 mr-1" />
            Filters
          </button>
          <button
            type="button"
            onClick={handleAddCustomer}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search in:
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="searchType"
                  checked={searchType === 'all'}
                  onChange={() => setSearchType('all')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">All fields</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="searchType"
                  checked={searchType === 'name'}
                  onChange={() => setSearchType('name')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Name only</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="searchType"
                  checked={searchType === 'mobile'}
                  onChange={() => setSearchType('mobile')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Mobile only</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 