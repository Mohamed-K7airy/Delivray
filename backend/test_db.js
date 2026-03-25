import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('URL:', supabaseUrl);
console.log('KEY:', supabaseKey ? supabaseKey.substring(0, 15) + '...' : 'undefined');

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing connection to users table...");
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Supabase Error:', error);
  } else {
    console.log('Users Data:', data);
  }
}

test();
