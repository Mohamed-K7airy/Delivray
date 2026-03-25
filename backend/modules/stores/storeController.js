import { supabase } from '../../config/supabase.js';

// @desc    Create store (linked to merchant user)
// @route   POST /stores
// @access  Private/Merchant
export const createStore = async (req, res) => {
  try {
    const { name, type, location_lat, location_lng } = req.body;

    const { data: store, error } = await supabase
      .from('stores')
      .insert([{ 
        owner_id: req.user.id, 
        name, 
        type, 
        location_lat, 
        location_lng 
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(store);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get all stores (with optional type and nearby filters)
// @route   GET /stores
// @access  Public
export const getStores = async (req, res) => {
  try {
    const { type, limit = 20, page = 1 } = req.query;
    // For nearby, you'd typically use PostGIS extension or calculate distance on frontend
    // Here we'll just do basic pagination and type filtering
    
    let query = supabase
      .from('stores')
      .select('id, name, type, location_lat, location_lng');

    if (type) {
      query = query.eq('type', type);
    }

    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;
    query = query.range(from, to);

    const { data: stores, error } = await query;
    if (error) throw error;

    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get single store by id + products
// @route   GET /stores/:id
// @access  Public
export const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (storeError || !store) return res.status(404).json({ message: 'Store not found' });

    // Fetch products for this store
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', id)
      .eq('availability', true);

    if (prodError) throw prodError;

    res.json({ ...store, products });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Update a store
// @route   PATCH /stores/:id
// @access  Private/Merchant
export const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Ownership check done in middleware or here
    const { data: store, error: fetchError } = await supabase
      .from('stores')
      .select('owner_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !store) return res.status(404).json({ message: 'Store not found' });
    if (store.owner_id !== req.user.id) return res.status(403).json({ message: 'Not authorized to update this store' });

    const { data: updatedStore, error } = await supabase
      .from('stores')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    res.json(updatedStore);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Delete a store
// @route   DELETE /stores/:id
// @access  Private/Merchant
export const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: store, error: fetchError } = await supabase
      .from('stores')
      .select('owner_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !store) return res.status(404).json({ message: 'Store not found' });
    if (store.owner_id !== req.user.id) return res.status(403).json({ message: 'Not authorized to delete this store' });

    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get logged in merchant's stores
// @route   GET /stores/me
// @access  Private/Merchant
export const getMyStores = async (req, res) => {
  try {
    const { data: stores, error } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', req.user.id);

    if (error) throw error;
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
// @desc    Get merchant store statistics
// @route   GET /stores/stats
// @access  Private/Merchant
export const getMerchantStats = async (req, res) => {
  try {
    const merchantId = req.user.id;

    // 1. Get merchant's stores
    const { data: stores } = await supabase.from('stores').select('id').eq('owner_id', merchantId);
    const storeIds = stores.map(s => s.id);
    if (storeIds.length === 0) return res.json({ revenue: 0, orders: 0, customers: 0, products: 0 });

    // 2. Aggregate Revenue and Order Count
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total_price, user_id')
      .in('store_id', storeIds)
      .eq('status', 'completed');
    
    if (ordersError) throw ordersError;

    const revenue = orders.reduce((sum, o) => sum + Number(o.total_price), 0);
    const orderCount = orders.length;

    // 3. Unique Customers
    const uniqueCustomers = new Set(orders.map(o => o.user_id)).size;

    // 4. Catalog Size
    const { count: productCount, error: prodError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .in('store_id', storeIds);

    if (prodError) throw prodError;

    res.json({
      revenue,
      orders: orderCount,
      customers: uniqueCustomers,
      products: productCount || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get merchant balance (calculated from orders - payouts)
// @route   GET /stores/balance
// @access  Private/Merchant
export const getMerchantBalance = async (req, res) => {
  try {
    const merchantId = req.user.id;

    // 1. Get total revenue from completed orders
    const { data: stores } = await supabase.from('stores').select('id').eq('owner_id', merchantId);
    if (!stores || stores.length === 0) return res.json({ available_balance: 0, pending_payouts: 0, total_withdrawn: 0 });
    
    const storeIds = stores.map(s => s.id);
    const { data: orders } = await supabase
      .from('orders')
      .select('total_price')
      .in('store_id', storeIds)
      .eq('status', 'completed');

    const totalRevenue = orders ? orders.reduce((sum, o) => sum + Number(o.total_price), 0) : 0;

    // 2. Get total paid out
    let totalWithdrawn = 0;
    let pendingPayouts = 0;
    
    try {
      const { data: payouts, error: payErr } = await supabase
        .from('payouts')
        .select('amount, status')
        .eq('merchant_id', merchantId);

      if (!payErr && payouts) {
        totalWithdrawn = payouts
          .filter(p => p.status === 'settled')
          .reduce((sum, p) => sum + Number(p.amount), 0);

        pendingPayouts = payouts
          .filter(p => p.status === 'pending')
          .reduce((sum, p) => sum + Number(p.amount), 0);
      }
    } catch (e) {
      console.log('Payouts table might not exist yet:', e.message);
    }

    res.json({
      available_balance: totalRevenue - totalWithdrawn - pendingPayouts,
      pending_payouts: pendingPayouts,
      total_withdrawn: totalWithdrawn
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get merchant payouts list
// @route   GET /stores/payouts
// @access  Private/Merchant
export const getMerchantPayouts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('merchant_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST204' || error.message.includes('not find')) return res.json([]);
      throw error;
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get merchant live map statistics
// @route   GET /stores/map-stats
// @access  Private/Merchant
export const getMerchantMapStats = async (req, res) => {
  try {
    const merchantId = req.user.id;

    // 1. Get merchant's stores
    const { data: stores } = await supabase.from('stores').select('id').eq('owner_id', merchantId);
    if (!stores || stores.length === 0) return res.json({ activeDrivers: 0, pendingPickups: 0, dispatchCenter: 0 });
    
    const storeIds = stores.map(s => s.id);

    // 2. Count "Pending Pickups" (orders ready for pickup)
    const { count: pendingPickups } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('store_id', storeIds)
      .eq('status', 'ready_for_pickup');

    // 3. Count "Active Drivers" (distinct drivers delivering merchant's orders)
    const { data: deliveringOrders } = await supabase
      .from('orders')
      .select('driver_id')
      .in('store_id', storeIds)
      .eq('status', 'delivering')
      .not('driver_id', 'is', null);

    const activeDrivers = deliveringOrders ? new Set(deliveringOrders.map(o => o.driver_id)).size : 0;

    res.json({
      activeDrivers,
      pendingPickups: pendingPickups || 0,
      dispatchCenter: stores.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
