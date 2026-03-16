import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('shipping_rates')
      .select('*')
      .eq('active', true)
      .order('city_name_en', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching shipping rates:', error);
    return NextResponse.json({ error: 'Failed to fetch shipping rates' }, { status: 500 });
  }
}
