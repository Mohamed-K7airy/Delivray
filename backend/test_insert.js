import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function test() {
  console.log("Testing insert into users table...");
  const { data, error } = await supabase.from('users').insert([{
    name: 'Test User',
    phone: '1234567890',
    password_hash: 'hash',
    role: 'customer'
  }]).select();
  
  if (error) {
    console.error('Supabase Error:', error.message, error.hint, error.details);
  } else {
    console.log('Inserted Data:', data);
  }
}

test();
