import React from 'react';
import { Building, MessageSquare, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SidebarItemProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

const SidebarItem = ({ href, icon, children }: SidebarItemProps) => {
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
};

export function SidebarNav() {
  return (
    <ul className="space-y-1">
      <SidebarItem href="/admin/venues" icon={<Building />}>
        Venues
      </SidebarItem>
      <SidebarItem href="/admin/sms-templates" icon={<MessageSquare />}>
        SMS Templates
      </SidebarItem>
      <SidebarItem href="/admin/settings" icon={<Settings />}>
        Settings
      </SidebarItem>
    </ul>
  );
} 