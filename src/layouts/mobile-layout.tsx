'use client';

import React, { ReactNode, useEffect } from 'react';
import { MobileNav } from '@/components/ui/mobile-nav';
import { applyMobileViewportFix } from '@/utils/mobile';
import { useMediaQuery } from '@/hooks/use-media-query';

interface MobileLayoutProps {
  children: ReactNode;
  navItems: Array<{
    label: string;
    href: string;
    icon?: ReactNode;
  }>;
  logo?: ReactNode;
  actions?: ReactNode;
}

export function MobileLayout({
  children,
  navItems,
  logo,
  actions,
}: MobileLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Apply viewport height fix for mobile browsers
  useEffect(() => {
    if (isMobile) {
      applyMobileViewportFix();
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Mobile navigation shown only on mobile */}
      {isMobile && (
        <MobileNav 
          items={navItems}
          logo={logo}
          actions={actions}
        />
      )}
      
      {/* Main content area with proper spacing for mobile */}
      <main className={`flex-1 ${isMobile ? 'pt-2 pb-16' : 'py-8'}`}>
        <div 
          className={`mx-auto w-full ${
            isMobile 
              ? 'px-4 max-w-full' 
              : 'px-6 max-w-7xl'
          }`}
        >
          {children}
        </div>
      </main>
      
      {/* Safe area at the bottom for mobile devices */}
      {isMobile && <div className="h-safe-area-bottom" />}
    </div>
  );
} 