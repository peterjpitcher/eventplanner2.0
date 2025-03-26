import React from 'react';
import { Building, MessageSquare, Settings } from 'lucide-react';
import { SidebarItem } from './sidebar-item';

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