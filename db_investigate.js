/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'C:/Users/dell/.gemini/antigravity/scratch/GLOSSY-STORE/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: slides } = await supabase.from('sliders').select('id, title, placement, image_url, image_base64');
  console.log("SLIDERS:", slides?.map(s => ({
    ...s,
    image_url: s.image_url?.substring(0, 50) + '...',
    image_base64: s.image_base64 ? 'EXISTS' : 'NULL'
  })));
  
  const { data: homeContent } = await supabase.from('home_content').select('*').single();
  console.log("HOME CONTENT PROMO SQUARES:", homeContent?.promo_squares?.map(s => ({ title: s.title, image: s.image?.substring(0, 50) + '...' })));
}

check().catch(console.error);
