import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We use the service role key to bypass RLS for this system operation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, cart, userId } = body;

    // Validate request
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty or invalid' }, { status: 400 });
    }

    if (!email && !phone && !userId) {
      return NextResponse.json({ error: 'Contact info or user ID required' }, { status: 400 });
    }

    // Insert or update abandoned cart
    // We check if an abandoned cart exists for this user email/phone
    let query = supabase.from('abandoned_carts').select('id, status');
    
    if (userId) {
      query = query.eq('user_id', userId);
    } else if (email) {
      query = query.eq('customer_email', email);
    } else if (phone) {
      query = query.eq('customer_phone', phone);
    }

    const { data: existingCarts, error: fetchError } = await query
      .eq('status', 'abandoned')
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching existing abandoned cart:', fetchError);
      return NextResponse.json({ error: 'Failed to track cart' }, { status: 500 });
    }

    const cartData = {
      user_id: userId || null,
      customer_email: email || null,
      customer_phone: phone || null,
      cart_data: cart,
      status: 'abandoned',
      updated_at: new Date().toISOString(),
    };

    if (existingCarts && existingCarts.length > 0) {
      // Update existing
      const { error: updateError } = await supabase
        .from('abandoned_carts')
        .update(cartData)
        .eq('id', existingCarts[0].id);

      if (updateError) throw updateError;
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from('abandoned_carts')
        .insert(cartData);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Abandoned cart tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
