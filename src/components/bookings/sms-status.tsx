import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type SMSStatusType = 'sent' | 'failed' | 'pending' | null;

interface SMSStatusProps {
  status: SMSStatusType;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  tooltipMessage?: string;
}

export function SMSStatus({ 
  status, 
  showLabel = true, 
  size = 'md',
  tooltipMessage
}: SMSStatusProps) {
  
  // Determine the size of the icon based on the size prop
  const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;
  
  // Text size classes based on the size prop
  const textSizeClass = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';
  
  // Get the appropriate icon and text based on status
  let icon;
  let label;
  let colorClass;
  let defaultTooltip;
  
  switch (status) {
    case 'sent':
      icon = <CheckCircle size={iconSize} className="text-green-500" />;
      label = 'Sent';
      colorClass = 'text-green-600';
      defaultTooltip = 'SMS was sent successfully';
      break;
    case 'failed':
      icon = <AlertCircle size={iconSize} className="text-red-500" />;
      label = 'Failed';
      colorClass = 'text-red-600';
      defaultTooltip = 'Failed to send SMS';
      break;
    case 'pending':
      icon = <Clock size={iconSize} className="text-amber-500" />;
      label = 'Pending';
      colorClass = 'text-amber-600';
      defaultTooltip = 'SMS is pending delivery';
      break;
    default:
      icon = <Clock size={iconSize} className="text-gray-400" />;
      label = 'Not Sent';
      colorClass = 'text-gray-500';
      defaultTooltip = 'No SMS has been sent for this booking';
  }
  
  // Use custom tooltip message if provided, otherwise use default
  const tooltipText = tooltipMessage || defaultTooltip;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-1 cursor-help">
            {icon}
            {showLabel && <span className={`${textSizeClass} ${colorClass} font-medium`}>{label}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 