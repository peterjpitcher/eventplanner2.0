import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-6">Event Planner</h1>
      <p className="text-xl mb-8">
        A web application to efficiently manage pub events, customer registrations, bookings, and automated SMS notifications.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
        <Link href="/auth/login" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Login
        </Link>
        <a 
          href="https://github.com/peterjpitcher/eventplanner2.0" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          GitHub
        </a>
      </div>
    </div>
  );
} 