import { supabase } from '../../config/supabase.js';

// @desc    Get all users (admin only)
// @route   GET /admin/users
export const getUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = supabase.from('users').select('*').order('created_at', { ascending: false });

    if (role) query = query.eq('role', role);
    if (search) {
      // Basic sanitization to prevent regex/pattern injection
      const safeSearch = search.replace(/[%_]/g, ''); 
      query = query.or(`name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`);
    }

    const { data: users, error } = await query;
    if (error) throw error;
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Update user status (ban/approve/reject)
// @route   PATCH /admin/users/:id/status
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active', 'banned', 'pending'

    // Status must be one of: 'active', 'pending', 'banned'
    const validStatuses = ['active', 'pending', 'banned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get all stores
// @route   GET /admin/stores
export const getAdminStores = async (req, res) => {
  try {
    const { data: stores, error } = await supabase
      .from('stores')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Toggle store admin-disable status
// @route   PATCH /admin/stores/:id/toggle-disable
export const toggleStoreAdminDisable = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_disabled } = req.body;

    const { data: store, error } = await supabase
      .from('stores')
      .update({ admin_disabled, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
// @desc    Get all pending users (merchants, drivers)
// @route   GET /admin/pending-users
export const getPendingUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, status, created_at')
      .eq('status', 'pending');

    if (error) throw error;
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Approve a pending user
// @route   PATCH /admin/approve-user/:id
export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: user, error } = await supabase
      .from('users')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error || !user) return res.status(404).json({ message: 'User not found or update failed' });
    res.json({ message: `User ${user.name} approved successfully`, user });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get all orders
// @route   GET /admin/orders
export const getAllOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, users(name), stores(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get System Stats
// @route   GET /admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: totalStores } = await supabase.from('stores').select('*', { count: 'exact', head: true });
    
    const { data } = await supabase.from('orders').select('total_price').eq('status', 'completed');
    const revenue = data ? data.reduce((acc, order) => acc + Number(order.total_price), 0) : 0;

    res.json({
      totalOrders: totalOrders || 0,
      totalUsers: totalUsers || 0,
      totalStores: totalStores || 0,
      totalRevenue: revenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
// @desc    Get Admin Financial Overview
// @route   GET /admin/financials
export const getAdminFinancials = async (req, res) => {
  try {
    // 1. Get all completed orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_price, subtotal, delivery_fee, created_at')
      .eq('status', 'completed');

    if (error) throw error;

    // 2. Calculate metrics
    const gmv = orders.reduce((acc, o) => acc + Number(o.total_price), 0);
    const totalSubtotal = orders.reduce((acc, o) => acc + Number(o.subtotal || 0), 0);
    const totalDeliveryFees = orders.reduce((acc, o) => acc + Number(o.delivery_fee || 3.0), 0);
    
    // Platform Commission (20% of subtotal)
    const platformCommission = totalSubtotal * 0.20;
    
    // Platform Net
    const platformNet = platformCommission;

    res.json({
      gmv: gmv.toFixed(2),
      platformCommission: platformCommission.toFixed(2),
      netMerchantPayout: netMerchantPayout.toFixed(2),
      platformNet: platformNet.toFixed(2),
      totalDeliveryFees: totalDeliveryFees.toFixed(2),
      orderCount: orders.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get all promo codes
// @route   GET /admin/promos
export const getAdminPromos = async (req, res) => {
  try {
    const { data: promos, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Create a new promo code
// @route   POST /admin/promos
export const createPromoCode = async (req, res) => {
  try {
    const { code, discount_amount, min_subtotal, expires_at } = req.body;
    const { data: promo, error } = await supabase
      .from('promo_codes')
      .insert([{ 
        code: code.toUpperCase(), 
        value: discount_amount, 
        min_subtotal, 
        expiry_date: expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 
        is_active: true,
        type: 'fixed' // Defaulting to fixed for the simple UI
      }])
      .select()
      .single();

    if (error) throw error;
    res.json(promo);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Delete a promo code
// @route   DELETE /admin/promos/:id
export const deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Promo code deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const getAdvancedStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: orders, error } = await supabase
      .from('orders')
      .select('created_at, total_price, status')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Aggregate by day
    const dailyData = {};
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyData[dateStr] = { orders: 0, revenue: 0 };
    }

    orders.forEach(order => {
      const date = order.created_at.split('T')[0];
      if (dailyData[date]) {
        dailyData[date].orders += 1;
        if (order.status !== 'cancelled') {
            dailyData[date].revenue += Number(order.total_price);
        }
      }
    });

    const result = Object.entries(dailyData)
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => a.date.localeCompare(b.date));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending payouts
// @route   GET /admin/pending-payouts
export const getPendingPayouts = async (req, res) => {
  try {
    const { data: payouts, error } = await supabase
      .from('payouts')
      .select('*, merchant:merchant_id(name, email), driver:driver_id(users(name, email))')
      .eq('status', 'pending');

    if (error) throw error;
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a payout
// @route   PATCH /admin/payouts/:id/approve
export const approvePayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: payout, error } = await supabase
      .from('payouts')
      .update({ status: 'settled', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(payout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Settle all driver weekly payouts
// @route   POST /admin/settle-driver-payouts
export const settleDriverPayouts = async (req, res) => {
  try {
    const { data: payouts, error } = await supabase
      .from('payouts')
      .update({ status: 'settled', updated_at: new Date().toISOString() })
      .eq('status', 'pending')
      .eq('payout_type', 'driver_weekly')
      .select();

    if (error) throw error;
    res.json({ message: `Settled ${payouts.length} driver payouts`, payouts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
