import { supabase } from '../backend/config/supabase.js';

async function verifyPayoutLogic() {
  console.log('--- Verifying Payout Logic ---');
  
  try {
    // 1. Fetch a merchant stores
    const { data: stores } = await supabase.from('stores').select('id, owner_id').limit(1);
    if (!stores || stores.length === 0) {
      console.log('No stores found to test with.');
      return;
    }
    const storeId = stores[0].id;
    const merchantId = stores[0].owner_id;

    console.log(`Testing with Store ID: ${storeId}, Merchant ID: ${merchantId}`);

    // 2. Fetch completed orders for this store
    const { data: orders } = await supabase
      .from('orders')
      .select('total_price, subtotal, delivery_fee')
      .eq('store_id', storeId)
      .eq('status', 'completed');

    if (!orders || orders.length === 0) {
      console.log('No completed orders found for this store. Please place a completed order to test.');
      return;
    }

    const DELIVERY_FEE_CONST = 3.00;
    let expectedRevenue = 0;

    orders.forEach((o, i) => {
      const subtotal = o.subtotal !== null ? Number(o.subtotal) : (Number(o.total_price) - (o.delivery_fee || DELIVERY_FEE_CONST));
      expectedRevenue += subtotal;
      console.log(`Order ${i+1}: Total=${o.total_price}, Subtotal=${o.subtotal}, Fee=${o.delivery_fee} -> Calc Subtotal=${subtotal}`);
    });

    console.log(`Total Expected Merchant Revenue: ${expectedRevenue}`);

    // This script is for manual inspection of the logic.
    // In a real test environment, we would call the API and compare the result.
    console.log('Logic verification complete. Compare this with the Merchant Dashboard revenue card.');
    
  } catch (err) {
    console.error('Error during verification:', err.message);
  }
}

verifyPayoutLogic();
