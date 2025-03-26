import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the events page
  redirect('/events');
  
  // This won't be reached due to the redirect
  return null;
} 