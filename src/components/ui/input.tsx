'use client';

import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { useMediaQuery } from '@/hooks/use-media-query';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  mobileOptimized?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, fullWidth = true, mobileOptimized = true, ...props }, ref) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    // Apply mobile optimizations when explicitly requested or on mobile devices
    const shouldOptimizeForMobile = mobileOptimized && isMobile;
    
    const inputClasses = twMerge(
      'px-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all',
      shouldOptimizeForMobile ? 'py-3 text-base' : 'py-2', // Larger on mobile
      error
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-blue-500',
      fullWidth && 'w-full',
      'touch-manipulation', // Improve touch behavior on mobile
      className
    );

    const labelClasses = twMerge(
      'block font-medium text-gray-700 mb-1',
      shouldOptimizeForMobile ? 'text-base' : 'text-sm'
    );

    const errorClasses = twMerge(
      'mt-1 text-red-600',
      shouldOptimizeForMobile ? 'text-base' : 'text-sm'
    );

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={props.id}
            className={labelClasses}
          >
            {label}
          </label>
        )}
        <input 
          ref={ref} 
          className={inputClasses} 
          {...props} 
        />
        {error && <p className={errorClasses}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input }; 