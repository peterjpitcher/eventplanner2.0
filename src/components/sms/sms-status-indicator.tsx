'use client';

import { SMSStatus } from '@/services/sms-service';

interface SMSStatusIndicatorProps {
  status: SMSStatus;
  className?: string;
}

export function SMSStatusIndicator({ status, className }: SMSStatusIndicatorProps) {
  // Define colors and labels based on status
  const statusConfig: Record<SMSStatus, { color: string; label: string }> = {
    'queued': { color: 'bg-blue-100 text-blue-800', label: 'Queued' },
    'sent': { color: 'bg-yellow-100 text-yellow-800', label: 'Sent' },
    'delivered': { color: 'bg-green-100 text-green-800', label: 'Delivered' },
    'failed': { color: 'bg-red-100 text-red-800', label: 'Failed' },
    'undelivered': { color: 'bg-red-100 text-red-800', label: 'Undelivered' },
    'simulated': { color: 'bg-purple-100 text-purple-800', label: 'Simulated' }
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${className || ''}`}
    >
      {config.label}
    </span>
  );
} 