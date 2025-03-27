import { NextResponse } from 'next/server';

// Mock event data for testing
const mockEvents = [
  {
    id: '1',
    name: 'Summer Concert',
    description: 'A fun outdoor concert',
    date: '2025-07-15',
    time: '19:00',
    capacity: 100,
    is_published: true,
    category_id: '1'
  },
  {
    id: '2',
    name: 'Tech Conference',
    description: 'Learn about the latest technologies',
    date: '2025-08-22',
    time: '09:00',
    capacity: 200,
    is_published: true,
    category_id: '2'
  },
  {
    id: '3',
    name: 'Art Exhibition',
    description: 'View works from local artists',
    date: '2025-09-10',
    time: '10:00',
    capacity: 50,
    is_published: true,
    category_id: '3'
  }
];

export async function GET() {
  try {
    // Return all mock events
    return NextResponse.json({ 
      success: true,
      events: mockEvents 
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
