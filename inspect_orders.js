const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  console.log("Orders top 1:", data);
  if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
  }
}
test();
