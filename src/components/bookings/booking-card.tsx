'use client';

import React from 'react';
import { Booking } from '@/services/booking-service';
import Link from 'next/link';
import { CalendarIcon, Clock, Users, FileText, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { formatDateTime } from '@/lib/date-utils';

interface BookingCardProps {
  booking: Booking;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

export function BookingCard({ booking, onDelete, deletingId }: BookingCardProps) {
  const isDeleting = deletingId === booking.id;
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      onDelete(booking.id);
    }
  };

  const customerName = booking.customer 
    ? `${booking.customer.first_name} ${booking.customer.last_name}`.trim() 
    : 'Unknown Customer';
  
  const eventTitle = booking.event ? booking.event.title : 'Unknown Event';

  return (
    <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
      {/* Booking header */}
      <div className="bg-blue-50 p-4 border-b border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900">
          {customerName}
        </h3>
        <p className="text-sm text-gray-600">{eventTitle}</p>
      </div>
      
      {/* Booking details */}
      <div className="p-4">
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Users size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-700">Seats: {booking.seats_or_reminder}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Clock size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-700">Booked on {formatDateTime(booking.created_at)}</span>
          </div>
          
          {booking.notes && (
            <div className="flex items-start text-sm">
              <FileText size={16} className="text-gray-400 mr-2 mt-0.5" />
              <span className="text-gray-700 line-clamp-2">{booking.notes}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between">
        <Link
          href={`/events/${booking.event_id}/bookings/${booking.id}`}
          className="inline-flex items-center text-xs font-medium text-blue-600"
        >
          <Eye size={14} className="mr-1" />
          View
        </Link>
        
        <Link
          href={`/events/${booking.event_id}/bookings/${booking.id}/edit`}
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
          {isDeleting ? (
            <>
              <Spinner size="sm" className="mr-1" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 size={14} className="mr-1" />
              Delete
            </>
          )}
        </button>
      </div>
    </div>
  );
} 