import { NextResponse } from 'next/server';

// Mock customer data for testing
const mockCustomers = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    mobile_number: '+447123456789',
    notes: 'VIP customer',
    created_at: '2024-03-15T10:00:00Z'
  },
  {
    id: '2',
    first_name: 'Jane',
    last_name: 'Smith',
    mobile_number: '+447987654321',
    notes: 'Regular attendee',
    created_at: '2024-03-16T11:30:00Z'
  },
  {
    id: '3',
    first_name: 'Robert',
    last_name: 'Johnson',
    mobile_number: '+447555123456',
    notes: 'New customer',
    created_at: '2024-03-20T14:15:00Z'
  }
];

export async function GET() {
  try {
    // Return all mock customers
    return NextResponse.json({ 
      success: true,
      customers: mockCustomers 
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
