/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error: fetchError } = await supabase.from('orders').select('*');
  if (fetchError) {
    console.error('Fetch error:', fetchError.message);
    return;
  }
  if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
  }
}
test();
