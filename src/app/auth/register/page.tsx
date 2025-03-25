import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Register - Event Planner',
  description: 'Create a new Event Planner account',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Event Planner</h1>
          <p className="mt-2 text-gray-600">Create your account</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
} 