'use client';

import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { MessagesTable } from './messages-table';
import { AppLayout } from '@/components/layout/app-layout';

export default function MessagesPage() {
  return (
    <AppLayout>
      <div className="container py-6">
        <PageHeader
          title="SMS Messages"
          description="View and manage customer SMS messages and replies"
        />
        
        <div className="bg-white shadow rounded-lg p-6">
          <MessagesTable />
        </div>
      </div>
    </AppLayout>
  );
} 