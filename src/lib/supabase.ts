import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if the environment variables contain actual values or just placeholders
const isRealSupabaseUrl = 
  supabaseUrl && 
  supabaseUrl !== 'your_supabase_url_here' && 
  supabaseUrl.includes('supabase.co');

const isRealSupabaseKey = 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your_supabase_anon_key_here' && 
  supabaseAnonKey.length > 10;

// If we don't have real credentials, console warn but create a client that won't break during build
if (!isRealSupabaseUrl || !isRealSupabaseKey) {
  console.warn('Supabase credentials missing or appear to be placeholders. Using mock client for build process.');
}

// Create the client with the real URL or a valid fallback for build time
const realOrBuildUrl = isRealSupabaseUrl ? supabaseUrl : 'https://example.supabase.co';
const realOrBuildKey = isRealSupabaseKey ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAwfQ.test';

export const supabase = createClient(realOrBuildUrl, realOrBuildKey);

export default supabase; 