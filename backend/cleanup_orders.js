import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function cleanup() {
  console.log('--- Starting Data Cleanup (Step 2: Orders & Stores) ---');

  // 1. Find MINI-FPL ID
  const { data: storeData } = await supabase
    .from('stores')
    .select('id')
    .eq('name', 'MINI-FPL')
    .single();

  if (storeData) {
    const storeId = storeData.id;
    console.log(`Found MINI-FPL ID: ${storeId}`);

    // a. Delete order_items first (they reference products which reference the store, OR they reference orders)
    // Actually orders reference store_id.
    
    // b. Delete orders associated with this store
    console.log('Skipping orders deletion to preserve history for MINI-FPL...');
    /*
    const { error: orderError } = await supabase
      .from('orders')
      .delete()
      .eq('store_id', storeId);
    
    if (orderError) console.error('Error deleting orders:', orderError);

    // c. Now delete the store (CASCADE should handle products)
    console.log('Deleting store MINI-FPL...');
    const { error: deleteError } = await supabase
      .from('stores')
      .delete()
      .eq('id', storeId);

    if (deleteError) {
      console.error('Error deleting store:', deleteError);
    } else {
      console.log('Successfully deleted MINI-FPL store.');
    }
    */
  } else {
    console.log('MINI-FPL store not found or already deleted.');
  }

  console.log('--- Cleanup Completed ---');
}

cleanup();
