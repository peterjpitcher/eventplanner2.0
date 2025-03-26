'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export function useRequireAuth(redirectTo = '/auth/login') {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`${redirectTo}?redirectTo=${pathname ? encodeURIComponent(pathname) : ''}`);
    }
  }, [user, isLoading, redirectTo, router, pathname]);

  return { user, isLoading };
} 