'use client';

import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { useMediaQuery } from '@/hooks/use-media-query';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  spacing?: 'small' | 'medium' | 'large';
  breakMode?: 'stack' | 'grid' | 'none';
  reverseOnMobile?: boolean;
}

export function ResponsiveContainer({
  children,
  className,
  spacing = 'medium',
  breakMode = 'stack',
  reverseOnMobile = false,
}: ResponsiveContainerProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Spacing classes based on the prop
  const spacingClasses = {
    small: isMobile ? 'gap-2' : 'gap-3',
    medium: isMobile ? 'gap-4' : 'gap-6',
    large: isMobile ? 'gap-6' : 'gap-8',
  };
  
  // Layout classes for different break modes
  const layoutClasses = isMobile
    ? {
        stack: 'flex flex-col',
        grid: 'grid grid-cols-1',
        none: 'flex flex-row',
      }
    : {
        stack: 'flex flex-row',
        grid: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        none: 'flex flex-row',
      };
  
  return (
    <div
      className={twMerge(
        layoutClasses[breakMode],
        spacingClasses[spacing],
        isMobile && reverseOnMobile && 'flex-col-reverse',
        isMobile && 'px-4', // Add horizontal padding on mobile
        className
      )}
    >
      {children}
    </div>
  );
} 