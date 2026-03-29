import { supabase } from '../config/supabase.js';

const AHMED_ID = '309a755e-7a22-4e89-b3a8-d05aeba46437';

async function cleanup() {
  console.log('--- Commencing Data Purge Protocol ---');

  // Identify stores to delete
  const { data: stores, error: fetchError } = await supabase
    .from('stores')
    .select('id, name')
    .eq('owner_id', AHMED_ID);

  if (fetchError) {
    console.error('Failed to locate target entities:', fetchError);
    process.exit(1);
  }

  if (!stores || stores.length === 0) {
    console.log('No signal detected for placeholder stores. Target already clean.');
    process.exit(0);
  }

  const storeIds = stores.map(s => s.id);
  console.log(`Identified ${stores.length} placeholder nodes:`, stores.map(s => s.name).join(', '));

  // 1. Delete associated orders first (violates foreign key otherwise)
  const { error: orderError } = await supabase
    .from('orders')
    .delete()
    .in('store_id', storeIds);

  if (orderError) {
    console.error('Order purge failure:', orderError);
    // Continue anyway or exit? Let's check if it's a constraint issue
  }

  // 2. Products and reviews will be deleted via CASCADE in the database schema
  const { error: deleteError } = await supabase
    .from('stores')
    .delete()
    .in('id', storeIds);

  if (deleteError) {
    console.error('Purge failure:', deleteError);
    process.exit(1);
  }

  console.log('--- Purge Successful. Network Cleaned. ---');
  process.exit(0);
}

cleanup();
