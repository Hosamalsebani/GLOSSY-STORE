
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function checkBuckets() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('Error listing buckets:', error);
    return;
  }
  console.log('Buckets:', data.map(b => b.name));
  
  if (!data.find(b => b.name === 'invoices')) {
    console.log('Creating invoices bucket...');
    const { data: newBucket, error: createError } = await supabase.storage.createBucket('invoices', {
      public: true,
      allowedMimeTypes: ['application/pdf'],
      fileSizeLimit: 5242880 // 5MB
    });
    if (createError) {
      console.error('Error creating invoices bucket:', createError);
    } else {
      console.log('Invoices bucket created successfully.');
    }
  } else {
    console.log('Invoices bucket already exists.');
  }
}

checkBuckets();
