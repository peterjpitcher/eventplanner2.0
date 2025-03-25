'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ClientOnly from '@/components/client-only';

// This component doesn't use useSearchParams directly, but uses window.location
export function LoginForm() {
  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Auth context
  const { signIn } = useAuth();

  // Form submission handler that takes a redirectTo parameter
  const handleSubmit = async (e: React.FormEvent, redirectTo: string = '/dashboard') => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }
      
      // Use window.location for client-side navigation to avoid useRouter
      window.location.href = redirectTo;
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
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
      
      <ClientOnly fallback={
        <form className="space-y-4">
          <Input
            label="Email"
            type="email"
            id="email-loading"
            placeholder="Loading..."
            disabled
          />
          <Input
            label="Password"
            type="password"
            id="password-loading"
            placeholder="Loading..."
            disabled
          />
          <Button
            type="button"
            fullWidth
            disabled
          >
            Log in
          </Button>
        </form>
      }>
        <form 
          onSubmit={(e) => {
            // Get redirectTo from URL search params on the client side
            const params = new URLSearchParams(window.location.search);
            const redirectTo = params.get('redirectTo') || '/dashboard';
            handleSubmit(e, redirectTo);
          }} 
          className="space-y-4"
        >
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
      </ClientOnly>
      
      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Don&apos;t have an account?</span>{' '}
        <Link href="/auth/register" className="text-blue-600 hover:text-blue-500">
          Register
        </Link>
      </div>
    </div>
  );
} 