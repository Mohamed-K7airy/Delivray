import { supabase } from './config/supabase.js';

async function checkStore() {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .ilike('name', '%وصاية%')
    .maybeSingle();

  if (error) {
    console.error('Error fetching store:', error);
    process.exit(1);
  }

  if (data) {
    console.log('--- Store Data found ---');
    console.log('ID:', data.id);
    console.log('Name:', data.name);
    console.log('Image:', data.image);
    console.log('-------------------------');
  } else {
    console.log('No store found with that name.');
  }
  process.exit(0);
}

checkStore();
