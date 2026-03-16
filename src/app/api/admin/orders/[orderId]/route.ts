import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function PATCH(req: NextRequest) {
  try {
    // Verify admin
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: adminData } = await supabase.from('admins').select('id').eq('email', user.email).single();
    if (!adminData) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { orderId, newStatus } = await req.json();
    if (!orderId || !newStatus) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );

    // Fetch the order to get cart_items for stock deduction
    const { data: order, error: fetchError } = await adminSupabase
      .from('orders')
      .select('status, cart_items, user_id, total_amount')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // If transitioning to 'processing' (approved), deduct stock
    // NOTE: Loyalty points are handled automatically by a DB trigger on status update
    const wasApproved = order.status === 'pending' && newStatus === 'processing';

    if (wasApproved && order.cart_items && Array.isArray(order.cart_items)) {
      for (const item of order.cart_items) {
        if (!item.id || !item.quantity) continue;
        const { data: product } = await adminSupabase
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single();

        if (product && typeof product.stock === 'number') {
          const newStock = Math.max(0, product.stock - item.quantity);
          await adminSupabase.from('products').update({ stock: newStock }).eq('id', item.id);
        }
      }
    }

    // Update order status
    const { error: updateError } = await adminSupabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, stockDeducted: wasApproved });
  } catch (err) {
    console.error('Order update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
