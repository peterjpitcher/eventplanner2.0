import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Login - Event Planner',
  description: 'Log in to your Event Planner account',
};

export default function LoginPage() {
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