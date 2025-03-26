'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './button';
import { AnimatePresence, motion } from 'framer-motion';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface MobileNavProps {
  items: NavItem[];
  logo?: React.ReactNode;
  actions?: React.ReactNode;
}

export function MobileNav({ items, logo, actions }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Prevent scrolling when menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile navigation bar with logo and hamburger button */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {logo}
        </div>
        <button
          onClick={toggleMenu}
          className="p-2 rounded-md touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span 
              className={`w-full h-0.5 bg-gray-800 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}
            />
            <span 
              className={`w-full h-0.5 bg-gray-800 transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}
            />
            <span 
              className={`w-full h-0.5 bg-gray-800 transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}
            />
          </div>
        </button>
      </nav>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-20 bg-white pt-16 pb-6 px-4 overflow-auto touch-manipulation"
          >
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <ul className="space-y-1 py-4">
                  {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link 
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center py-3 px-4 text-base rounded-md touch-manipulation ${
                            isActive 
                              ? 'bg-blue-50 text-blue-600 font-medium' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {item.icon && (
                            <span className="mr-3">{item.icon}</span>
                          )}
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              
              {actions && (
                <div className="mt-auto pt-4 border-t border-gray-200">
                  {actions}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to account for fixed navigation */}
      <div className="lg:hidden h-14" />
    </>
  );
} 