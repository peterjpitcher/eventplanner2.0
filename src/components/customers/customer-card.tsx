'use client';

import React from 'react';
import { Customer } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { customerService } from '@/services/customer-service';
import { toast } from 'sonner';
import { Phone, User, FileText, Edit, Trash2, Eye } from 'lucide-react';

interface CustomerCardProps {
  customer: Customer;
  onCustomerDeleted?: () => void;
}

export function CustomerCard({ customer, onCustomerDeleted }: CustomerCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Function to handle customer deletion
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      setIsDeleting(true);
      setDeleteError(null);
      
      // Get customer name for better user feedback
      const customerName = `${customer.first_name} ${customer.last_name || ''}`.trim();
      
      try {
        // Call the service to delete the customer
        const { error } = await customerService.deleteCustomer(customer.id);
        
        if (error) {
          throw error;
        }
        
        // Delete was successful
        toast.success(`${customerName} has been deleted`);
        
        // Notify parent component about the deletion
        if (onCustomerDeleted) {
          onCustomerDeleted();
        }
      } catch (error: any) {
        console.error('Error deleting customer:', error);
        
        // Show error message
        const errorMessage = error.message || 'Unknown error';
        setDeleteError(`Failed to delete customer: ${errorMessage}`);
        
        // Show toast with more specific message
        if (errorMessage.includes('existing bookings')) {
          toast.error(`Cannot delete ${customerName}: This customer has existing bookings. Please delete the bookings first.`);
        } else {
          toast.error(`Failed to delete ${customerName}: ${errorMessage}`);
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
      {/* Customer header */}
      <div className="bg-blue-50 p-4 border-b border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900">
          {customer.first_name} {customer.last_name}
        </h3>
      </div>
      
      {/* Customer details */}
      <div className="p-4">
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Phone size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-700">{customer.mobile_number}</span>
          </div>
          
          {customer.notes && (
            <div className="flex items-start text-sm">
              <FileText size={16} className="text-gray-400 mr-2 mt-0.5" />
              <span className="text-gray-700 line-clamp-2">
                {customer.notes}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between">
        <Link
          href={`/customers/${customer.id}`}
          className="inline-flex items-center text-xs font-medium text-blue-600"
        >
          <Eye size={14} className="mr-1" />
          View
        </Link>
        
        <Link
          href={`/customers/${customer.id}/edit`}
          className="inline-flex items-center text-xs font-medium text-indigo-600"
        >
          <Edit size={14} className="mr-1" />
          Edit
        </Link>
        
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`inline-flex items-center text-xs font-medium text-red-600 ${
            isDeleting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Trash2 size={14} className="mr-1" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
      
      {/* Error message */}
      {deleteError && (
        <div className="p-3 bg-red-50 text-red-700 text-sm border-t border-red-100">
          {deleteError}
        </div>
      )}
    </div>
  );
} 