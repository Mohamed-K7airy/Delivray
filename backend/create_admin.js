import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function createAdmin() {
  const phone = '0000';
  const password = 'admin';

  const { data: exists } = await supabase.from('users').select('id').eq('phone', phone).maybeSingle();
  if (exists) {
    console.log("Admin account already exists with phone 0000");
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const { data, error } = await supabase.from('users').insert([{
    name: 'Super Admin',
    phone,
    password: hashedPassword,
    role: 'admin',
    status: 'active'
  }]).select();

  if (error) console.error('Error creating admin:', error);
  else console.log('Admin created successfully with phone 0000!');
}

createAdmin();
