import React from 'react';
import { Button } from './button';
import Link from 'next/link';

interface ActionProps {
  label: string;
  href: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ActionProps;
  secondaryAction?: ActionProps;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  action, 
  secondaryAction 
}) => {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>
      <div className="flex space-x-3">
        {secondaryAction && (
          <Link href={secondaryAction.href}>
            <Button variant="outline">{secondaryAction.label}</Button>
          </Link>
        )}
        {action && (
          <Link href={action.href}>
            <Button>{action.label}</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default PageHeader; 