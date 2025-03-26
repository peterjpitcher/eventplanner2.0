import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItemProps {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}

export function SidebarItem({ href, icon, children }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <li>
      <Link
        href={href}
        className={`
          flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium 
          ${
            isActive
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }
        `}
      >
        <span className={`h-5 w-5 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
          {icon}
        </span>
        {children}
      </Link>
    </li>
  );
} 