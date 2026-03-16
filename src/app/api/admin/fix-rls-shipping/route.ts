import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Using RPC or raw query with service role to bypass RLS
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Admins can manage shipping rates" ON shipping_rates;
        CREATE POLICY "Admins can manage shipping rates" 
            ON shipping_rates FOR ALL
            USING (
              auth.uid() IN (SELECT id FROM admins)
            );

        DROP POLICY IF EXISTS "Anyone can view shipping rates" ON shipping_rates;
        CREATE POLICY "Anyone can view shipping rates" 
            ON shipping_rates FOR SELECT 
            USING (true);
      `
    });

    if (error1) {
      // Fallback: The exec_sql RPC might not exist, but let's see. 
      // If we don't have exec_sql, we'll need the user to run it in the dashboard.
      return NextResponse.json({ error: error1 });
    }

    return NextResponse.json({ success: true, message: 'Policies updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
