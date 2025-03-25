import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/solid';

interface BreadcrumbItem {
  label: string;
  href: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  includeHome?: boolean;
}

export function Breadcrumb({ items, includeHome = false }: BreadcrumbProps) {
  const allItems = includeHome 
    ? [{ label: 'Home', href: '/', active: false }, ...items] 
    : items;

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          
          return (
            <li key={item.href} className="inline-flex items-center">
              {index > 0 && (
                <ChevronRightIcon 
                  className="h-4 w-4 text-gray-400 mx-1" 
                  aria-hidden="true" 
                />
              )}
              
              {isLast || item.active ? (
                <span className="text-sm font-medium text-gray-700" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link 
                  href={item.href}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {index === 0 && includeHome ? (
                    <span className="flex items-center">
                      <HomeIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                      {item.label}
                    </span>
                  ) : (
                    item.label
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
} 