'use client';

import React, { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

// Loading component
function LoginPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="h-8 bg-gray-200 rounded-md w-48 mx-auto animate-pulse"></div>
          <div className="mt-2 h-4 bg-gray-200 rounded-md w-64 mx-auto animate-pulse"></div>
        </div>
        <div className="h-96 bg-white rounded-lg shadow-md animate-pulse"></div>
      </div>
    </div>
  );
}

// Content component
function LoginPageContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Event Planner</h1>
          <p className="mt-2 text-gray-600">Manage pub events efficiently</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageLoading />}>
      <LoginPageContent />
    </Suspense>
  );
} 