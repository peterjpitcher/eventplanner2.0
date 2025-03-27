import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Required environment variables NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set');
}

// Create a Supabase client with the service role key
export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Test the connection when the module loads
(async () => {
  try {
    const { data, error } = await supabaseAdmin.from('sms_messages').select('count(*)', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase admin connection test failed:', error);
    } else {
      console.log('Supabase admin connection successful, sms_messages count:', data);
    }
  } catch (error) {
    console.error('Error testing Supabase admin connection:', error);
  }
})();

export default supabaseAdmin; 