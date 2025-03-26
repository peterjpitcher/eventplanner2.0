'use client';

import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { useMediaQuery } from '@/hooks/use-media-query';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  responsiveLayout?: boolean;
}

export function Form({
  children,
  className,
  title,
  subtitle,
  responsiveLayout = true,
  ...props
}: FormProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const shouldRespond = responsiveLayout && isMobile;
  
  return (
    <form
      className={twMerge(
        'bg-white shadow-md rounded-lg',
        shouldRespond ? 'p-4' : 'p-6',
        className
      )}
      {...props}
    >
      {title && (
        <h2 
          className={twMerge(
            'font-semibold text-gray-800',
            shouldRespond ? 'text-xl mb-2' : 'text-2xl mb-4'
          )}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <p 
          className={twMerge(
            'text-gray-600',
            shouldRespond ? 'text-sm mb-3' : 'mb-6'
          )}
        >
          {subtitle}
        </p>
      )}
      <div
        className={twMerge(
          'space-y-4',
          shouldRespond && 'space-y-3'
        )}
      >
        {children}
      </div>
    </form>
  );
} 