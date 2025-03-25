import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { MessagesTable } from './messages-table';

export const metadata = {
  title: 'SMS Messages | Event Planner',
  description: 'View and manage customer SMS messages',
};

export default async function MessagesPage() {
  return (
    <div className="container py-6">
      <PageHeader
        title="SMS Messages"
        description="View and manage customer SMS messages and replies"
      />
      
      <div className="bg-white shadow rounded-lg p-6">
        <MessagesTable />
      </div>
    </div>
  );
} 