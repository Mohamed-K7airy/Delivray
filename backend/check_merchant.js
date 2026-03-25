import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'c:/Users/Administrator/Desktop/Delivray/backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkData() {
  console.log('Checking stores and orders for Ahmed...');
  
  // 1. Find Ahmed
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*')
    .ilike('name', '%Ahmed%');
    
  if (userError || !users || users.length === 0) {
    console.log('User Ahmed not found or error:', userError);
    return;
  }
  
  for (const user of users) {
    console.log(`\nUser: ${user.name} (ID: ${user.id}, Role: ${user.role})`);
    
    // 2. Find his stores
    const { data: stores, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', user.id);
      
    if (storeError) {
      console.log('Error fetching stores:', storeError);
      continue;
    }
    
    if (!stores || stores.length === 0) {
      console.log('No stores found for this user.');
      continue;
    }
    
    const storeIds = stores.map(s => s.id);
    console.log(`Stores: ${stores.map(s => `${s.name} (${s.id})`).join(', ')}`);
    
    // 3. Find his orders
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('id, status, created_at')
      .in('store_id', storeIds);
      
    if (orderError) {
      console.log('Error fetching orders:', orderError);
    } else {
      console.log(`Total Orders: ${orders.length}`);
      if (orders.length > 0) {
        console.log('Statuses:', orders.map(o => o.status).reduce((acc, s) => { acc[s] = (acc[s] || 0) + 1; return acc; }, {}));
      }
    }
  }
}

checkData();
