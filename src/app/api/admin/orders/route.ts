import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Verify admin
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: adminData } = await supabase.from('admins').select('id').eq('email', user.email).single();
    if (!adminData) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Use service role to bypass RLS
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );

    const { data: orders, error } = await adminSupabase
      .from('orders')
      .select(`
        id,
        customer_name,
        customer_email,
        customer_phone,
        address,
        region,
        total_amount,
        status,
        created_at,
        cart_items,
        user_id,
        coupon_code,
        discount_amount
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    return NextResponse.json({ orders });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
