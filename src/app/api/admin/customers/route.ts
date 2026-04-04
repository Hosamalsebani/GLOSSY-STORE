import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // First verify the current user is an admin using the session-based client
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user is an admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!adminData) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use standard authenticated client to fetch users


    // Fetch all non-admin users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, phone_number, created_at, is_blocked')
      .neq('role', 'admin');

    // Fetch all orders to aggregate stats
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('customer_email, customer_name, customer_phone, total_amount, created_at');

    if (usersError || ordersError) {
      console.error('Error fetching data:', usersError || ordersError);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    // Combine and aggregate
    const customersMap = new Map();

    // Add users first
    users?.forEach(user => {
      customersMap.set(user.email.toLowerCase(), {
        id: user.id,
        email: user.email,
        name: user.full_name,
        phone: user.phone_number,
        joinedAt: user.created_at,
        isBlocked: user.is_blocked,
        orderCount: 0,
        totalSpent: 0
      });
    });

    // Aggregate orders
    orders?.forEach(order => {
      if (!order.customer_email) return;
      const email = order.customer_email.toLowerCase();
      
      if (!customersMap.has(email)) {
        // Customer who hasn't registered a user account but has an order
        customersMap.set(email, {
          id: `guest-${email}`,
          email: order.customer_email,
          name: order.customer_name || 'Anonymous',
          phone: order.customer_phone,
          joinedAt: order.created_at, // First order date
          isBlocked: false, // Guests are not in users table
          orderCount: 0,
          totalSpent: 0
        });
      }

      const customer = customersMap.get(email);
      customer.orderCount += 1;
      customer.totalSpent += Number(order.total_amount) || 0;
      
      // Keep the earliest date as joined date
      if (new Date(order.created_at) < new Date(customer.joinedAt)) {
        customer.joinedAt = order.created_at;
      }

      // Update name/phone if missing in user record
      if (!customer.name && order.customer_name) customer.name = order.customer_name;
      if (!customer.phone && order.customer_phone) customer.phone = order.customer_phone;
    });

    const customers = Array.from(customersMap.values()).sort((a, b) => 
      new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
    );

    return NextResponse.json({ customers });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user is an admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!adminData) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, isBlocked } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Use standard authenticated client
    const { error } = await supabase
      .from('users')
      .update({ is_blocked: isBlocked })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user status:', error);
      return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
    }

    return NextResponse.json({ success: true, isBlocked });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
