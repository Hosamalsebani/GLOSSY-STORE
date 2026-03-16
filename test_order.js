
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  // First login as some user or get a session to bypass RLS, or use service role
  // Let's use service role key if available to inspect DB errors easily
  const adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  // Try inserting into orders without user_id first using admin to see if schema works
  const { data, error } = await adminSupabase.from('orders').insert({
    total: 200,
    status: 'pending',
    shipping_address: { city: 'Tripolis (طرابلس)' }
  }).select();

  console.log("DB Insert result:", data, error);
}

test();
