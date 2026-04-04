import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: adminData } = await supabase.from('admins').select('id').eq('email', user.email).single();
    if (!adminData) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data: rates, error } = await supabase
      .from('shipping_rates')
      .select('*')
      .order('city_name_en', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ rates });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: adminData } = await supabase.from('admins').select('id').eq('email', user.email).single();
    if (!adminData) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Use standard authenticated client since RLS allows admins
    // to perform mutations.


    const body = await req.json();
    const { city_name_en, city_name_ar, cost, active } = body;

    const { data, error } = await supabase
      .from('shipping_rates')
      .insert({ city_name_en, city_name_ar, cost, active })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error creating shipping rate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const { id, city_name_en, city_name_ar, cost, active } = await req.json();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: adminData } = await supabase.from('admins').select('id').eq('email', user.email).single();
    if (!adminData) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Use standard authenticated client since RLS allows admins
    // to perform mutations.


    const { data, error } = await supabase
      .from('shipping_rates')
      .update({ city_name_en, city_name_ar, cost, active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating shipping rate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: adminData } = await supabase.from('admins').select('id').eq('email', user.email).single();
    if (!adminData) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Use standard authenticated client since RLS allows admins
    // to perform mutations.


    const { error } = await supabase
      .from('shipping_rates')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting shipping rate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
