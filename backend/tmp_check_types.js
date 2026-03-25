import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTypes() {
  const { data, error } = await supabase
    .from('stores')
    .select('type');
  
  if (error) {
    console.error(error);
    return;
  }
  
  const types = [...new Set(data.map(s => s.type))];
  console.log('Distinct Store Types:', types);
}

checkTypes();
