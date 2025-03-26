'use client';

import React from 'react';
import { ReactNode } from 'react';
import { Skeleton } from '../ui/skeleton';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  description?: string;
  isLoading?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'yellow';
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-700',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    text: 'text-green-700',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    text: 'text-purple-700',
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'bg-yellow-100 text-yellow-600',
    text: 'text-yellow-700',
  },
};

export function StatsCard({
  title,
  value,
  icon,
  description,
  isLoading = false,
  color = 'blue',
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div className={`p-4 ${colors.bg} rounded-lg border border-${color}-200`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {isLoading ? (
            <Skeleton className="h-9 w-20 mt-1" />
          ) : (
            <p className={`text-2xl font-semibold ${colors.text} mt-1`}>
              {value}
            </p>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-2 rounded-md ${colors.icon}`}>{icon}</div>
      </div>
    </div>
  );
} 