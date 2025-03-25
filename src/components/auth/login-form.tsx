'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Extract the part that uses useSearchParams into a separate component
function LoginFormContent() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
        return;
      }
      
      router.push(redirectTo);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Log in to your account</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          autoComplete="email"
          required
        />
        
        <Input
          label="Password"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
        
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Forgot your password?
            </a>
          </div>
        </div>
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading}
        >
          Log in
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Don&apos;t have an account?</span>{' '}
        <Link href="/auth/register" className="text-blue-600 hover:text-blue-500">
          Register
        </Link>
      </div>
    </div>
  );
}

// Create a loading fallback component
function LoginFormLoading() {
  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse mx-auto mb-6"></div>
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded-md animate-pulse mt-4"></div>
      </div>
    </div>
  );
}

// Main component that wraps the LoginFormContent in a Suspense boundary
export function LoginForm() {
  return (
    <Suspense fallback={<LoginFormLoading />}>
      <LoginFormContent />
    </Suspense>
  );
} 